-- [BAN USERS] Admins can ban/unban users.
--
-- Banned users keep read access (they can still browse plekjes), but are
-- blocked from:
--   - voting (insert/update/delete on votes)
--   - adding plekjes (insert on locations)
--   - attaching tags to plekjes (insert on location_tags)
--
-- Implemented via:
--   1. `banned_at` column on public.users (nullable timestamptz).
--   2. `is_user_banned()` helper, used in RLS WITH CHECK clauses.
--   3. RLS updates on votes / locations / location_tags.
--
-- Admin writes still happen via the service-role client in adminApi.ts, so
-- admin moderation paths are unaffected by these checks.

-- ─── Schema: banned_at column ───────────────────────────────────────────
alter table public.users
  add column if not exists banned_at timestamptz;

-- ─── Helper: is_user_banned() ───────────────────────────────────────────
-- SECURITY DEFINER mirrors the get_user_role() shape so RLS can call it
-- without recursing into users' own RLS. Returns true iff the caller's
-- row has a non-null banned_at.
create or replace function public.is_user_banned()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1 from public.users
     where id = auth.uid()
       and banned_at is not null
  );
$$;

-- Match the get_user_role() lock-down: callable from RLS, not REST.
revoke execute on function public.is_user_banned() from public, anon;

-- ─── RLS: votes ─────────────────────────────────────────────────────────
-- "Can't vote" means no insert, no update (changing vote_type), and no
-- delete (retracting a prior vote) while banned.
drop policy if exists "Users can insert own votes" on public.votes;
drop policy if exists "Users can update own votes" on public.votes;
drop policy if exists "Users can delete own votes" on public.votes;

create policy "Users can insert own votes" on public.votes
  for insert with check (
    user_id = auth.uid()
    and not public.is_user_banned()
  );
create policy "Users can update own votes" on public.votes
  for update using (user_id = auth.uid())
              with check (
                user_id = auth.uid()
                and not public.is_user_banned()
              );
create policy "Users can delete own votes" on public.votes
  for delete using (
    user_id = auth.uid()
    and not public.is_user_banned()
  );

-- ─── RLS: locations INSERT ──────────────────────────────────────────────
-- Banned users can't submit new plekjes. Restate the existing
-- submitted_by = auth.uid() rule from 20260510173600_fix_infinite_recursion.sql
-- with the ban guard added.
drop policy if exists "Users can insert locations" on public.locations;

create policy "Users can insert locations" on public.locations
  for insert with check (
    auth.uid() = submitted_by
    and not public.is_user_banned()
  );

-- ─── RLS: location_tags INSERT ──────────────────────────────────────────
-- Re-state the submitter-or-admin rule from 20260515120000_audit_fixes.sql,
-- with a not-banned guard on the submitter path. Admins still bypass via
-- the second branch.
drop policy if exists "Submitters or admins can insert location_tags" on public.location_tags;

create policy "Submitters or admins can insert location_tags" on public.location_tags
  for insert with check (
    auth.uid() is not null
    and (
      (
        exists (
          select 1 from public.locations l
           where l.id = location_id
             and l.submitted_by = auth.uid()
        )
        and not public.is_user_banned()
      )
      or public.get_user_role() in ('admin', 'superadmin')
    )
  );
