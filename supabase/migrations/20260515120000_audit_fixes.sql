-- [AUDIT FIXES] Pre-launch hardening from the codebase audit.
--
-- Addresses:
--   H1  length CHECK on users.display_name (charset stays in app)
--   H2  length CHECK on locations name/address/neighborhood
--   H3  scope location_tags INSERT to submitter or admin only
--   M2  restrict anon's column-level SELECT on public.users
--   M4  unique index on (normalised address, city_id)
--   --  defensively ensure unique(votes.user_id, location_tag_id)
--

-- ─── H2: length constraints on user-submitted location text ─────────────
alter table public.locations
  add constraint locations_name_length
    check (length(name) between 1 and 120);
alter table public.locations
  add constraint locations_address_length
    check (length(address) between 1 and 200);
alter table public.locations
  add constraint locations_neighborhood_length
    check (neighborhood is null or length(neighborhood) between 1 and 100);

-- ─── H1: length constraint on display_name ──────────────────────────────
-- Charset (`[a-zA-Z0-9_-]+`) is enforced in the app (lib/displayName.ts).
-- The trigger-created default used to be 'Nieuw lid' which contains a
-- space — update it to a charset-safe value so future inserts comply with
-- the app-level check, and add the length CHECK to the table.
alter table public.users
  add constraint users_display_name_length
    check (length(trim(display_name)) between 1 and 24);

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, display_name, pronoun)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data->>'display_name',
      'NieuwLid' || substr(replace(new.id::text, '-', ''), 1, 8)
    ),
    coalesce((new.raw_user_meta_data->>'pronoun')::pronoun, 'neutraal')
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public, pg_temp;

revoke execute on function public.handle_new_user() from public, anon, authenticated;

-- ─── H3: tighten location_tags INSERT policy ────────────────────────────
-- Previous policy let any authenticated user attach tags to any location,
-- which is effectively content tampering on someone else's listing. Now
-- only the location's submitter (or an admin) can insert tags.
drop policy if exists "Authenticated can insert location_tags" on public.location_tags;
drop policy if exists "Submitters or admins can insert location_tags" on public.location_tags;

create policy "Submitters or admins can insert location_tags" on public.location_tags
  for insert with check (
    auth.uid() is not null
    and (
      exists (
        select 1 from public.locations l
         where l.id = location_id
           and l.submitted_by = auth.uid()
      )
      or public.get_user_role() in ('admin', 'superadmin')
    )
  );

-- ─── M2: restrict anon's column-level SELECT on users ───────────────────
-- The "Public read access for users" RLS row-policy stays (anon can still
-- see every row), but we strip anon's SELECT permission to only the
-- columns needed for public attribution. Scrapers can no longer dump
-- approved_count, preferred_city_id, bio, created_at en masse.
revoke select on public.users from anon;
grant select (id, display_name, pronoun, role, avatar_url) on public.users to anon;

-- ─── M4: address uniqueness within a city ───────────────────────────────
-- Catches fuzzy duplicates the client-side ilike check misses (different
-- casing, leading/trailing whitespace, runs of internal whitespace). The
-- partial WHERE clause lets a submitter retry an address that was
-- previously rejected.
create unique index if not exists locations_address_city_unique
  on public.locations (regexp_replace(lower(trim(address)), '\s+', ' ', 'g'), city_id)
  where status <> 'rejected';

-- ─── Safety: votes(user_id, location_tag_id) uniqueness ─────────────────
-- The VoteButtons component uses upsert with onConflict=user_id,location_tag_id.
-- The unique constraint should already exist (created in the dashboard
-- pre-migrations), but it isn't tracked in any migration file — pin it
-- down here so a future db reset doesn't drop it.
do $$
begin
  if not exists (
    select 1
      from pg_constraint
     where conrelid = 'public.votes'::regclass
       and contype = 'u'
       and conkey = (
         select array_agg(attnum order by attnum)
           from pg_attribute
          where attrelid = 'public.votes'::regclass
            and attname in ('user_id', 'location_tag_id')
       )
  ) then
    alter table public.votes
      add constraint votes_user_id_location_tag_id_key
      unique (user_id, location_tag_id);
  end if;
end $$;
