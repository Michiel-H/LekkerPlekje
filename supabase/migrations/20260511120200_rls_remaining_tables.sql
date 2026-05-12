-- [CRITICAL] Enable RLS and add policies for tables that lacked them:
--   votes, favorites, waitlist_signups, tags, cities.
--
-- Without these, anyone with the public anon key could vote as another
-- user, read all favorites, or scrape the waitlist email list.

-- ───────────────────────────────── votes ────────────────────────────────
alter table public.votes enable row level security;

drop policy if exists "Public read access for votes" on public.votes;
drop policy if exists "Users can read own votes" on public.votes;
drop policy if exists "Users can insert own votes" on public.votes;
drop policy if exists "Users can update own votes" on public.votes;
drop policy if exists "Users can delete own votes" on public.votes;
drop policy if exists "Admins can read all votes" on public.votes;

-- Anyone can read aggregated counts via location_tags; individual votes are private.
create policy "Users can read own votes" on public.votes
  for select using (user_id = auth.uid());
create policy "Admins can read all votes" on public.votes
  for select using (public.get_user_role() in ('admin', 'superadmin'));
create policy "Users can insert own votes" on public.votes
  for insert with check (user_id = auth.uid());
create policy "Users can update own votes" on public.votes
  for update using (user_id = auth.uid())
              with check (user_id = auth.uid());
create policy "Users can delete own votes" on public.votes
  for delete using (user_id = auth.uid());

-- ─────────────────────────────── favorites ──────────────────────────────
-- Defined here in case it wasn't created with RLS in the dashboard.
alter table public.favorites enable row level security;

drop policy if exists "Users can read own favorites" on public.favorites;
drop policy if exists "Users can insert own favorites" on public.favorites;
drop policy if exists "Users can delete own favorites" on public.favorites;

create policy "Users can read own favorites" on public.favorites
  for select using (user_id = auth.uid());
create policy "Users can insert own favorites" on public.favorites
  for insert with check (user_id = auth.uid());
create policy "Users can delete own favorites" on public.favorites
  for delete using (user_id = auth.uid());

-- ────────────────────────── waitlist_signups ────────────────────────────
alter table public.waitlist_signups enable row level security;

drop policy if exists "Anyone can sign up to waitlist" on public.waitlist_signups;
-- Pre-existing dashboard-created policy with slightly different name:
drop policy if exists "Anyone can sign up for waitlist" on public.waitlist_signups;
drop policy if exists "Admins can read waitlist" on public.waitlist_signups;
drop policy if exists "Admins can delete waitlist entries" on public.waitlist_signups;

create policy "Anyone can sign up to waitlist" on public.waitlist_signups
  for insert with check (true);
create policy "Admins can read waitlist" on public.waitlist_signups
  for select using (public.get_user_role() in ('admin', 'superadmin'));
create policy "Admins can delete waitlist entries" on public.waitlist_signups
  for delete using (public.get_user_role() in ('admin', 'superadmin'));

-- ───────────────────────────────── tags ─────────────────────────────────
alter table public.tags enable row level security;

drop policy if exists "Public read access for tags" on public.tags;
drop policy if exists "Admins can manage tags" on public.tags;

create policy "Public read access for tags" on public.tags
  for select using (true);
create policy "Admins can manage tags" on public.tags
  for all using (public.get_user_role() in ('admin', 'superadmin'))
          with check (public.get_user_role() in ('admin', 'superadmin'));

-- ─────────────────────────────── cities ─────────────────────────────────
alter table public.cities enable row level security;

drop policy if exists "Public read access for cities" on public.cities;
drop policy if exists "Admins can manage cities" on public.cities;

create policy "Public read access for cities" on public.cities
  for select using (true);
create policy "Admins can manage cities" on public.cities
  for all using (public.get_user_role() in ('admin', 'superadmin'))
          with check (public.get_user_role() in ('admin', 'superadmin'));

-- ────────────────── locations: hide pending/rejected ────────────────────
-- The previous SELECT policy was `USING (true)` which let anyone fetch a
-- pending or rejected location by UUID. Tighten it: public reads see only
-- published rows; owners and admins see everything they need.
drop policy if exists "Public read access for locations" on public.locations;
drop policy if exists "Public can read published locations" on public.locations;
drop policy if exists "Owners can read own locations" on public.locations;
drop policy if exists "Admins can read all locations" on public.locations;

create policy "Public can read published locations" on public.locations
  for select using (status = 'published');
create policy "Owners can read own locations" on public.locations
  for select using (submitted_by = auth.uid());
create policy "Admins can read all locations" on public.locations
  for select using (public.get_user_role() in ('admin', 'superadmin'));
