-- LekkerPlekje.nl Database Schema
-- Run this in Supabase SQL Editor

-- Enums
create type user_role as enum ('visitor', 'scout', 'admin');
create type pronoun as enum ('vent', 'griet', 'neutraal');
create type location_status as enum ('pending', 'approved', 'rejected');
create type city_status as enum ('live', 'coming_soon');
create type vote_type as enum ('up', 'down');
create type tag_category as enum ('gezelschap', 'vibe', 'setting');

-- Users (extends Supabase auth.users)
create table public.users (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  pronoun pronoun not null default 'neutraal',
  role user_role not null default 'visitor',
  approved_count int not null default 0,
  created_at timestamptz not null default now()
);

-- Cities
create table public.cities (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  status city_status not null default 'coming_soon',
  live_since timestamptz
);

-- Locations
create table public.locations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text not null,
  city_id uuid not null references public.cities(id),
  neighborhood text,
  lat double precision,
  lng double precision,
  image_url text,
  status location_status not null default 'pending',
  submitted_by uuid not null references public.users(id),
  approved_by uuid references public.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

-- Tags
create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  category tag_category not null,
  emoji text not null,
  sort_order int not null default 0
);

-- Location-Tag junction (with motivation per tag)
create table public.location_tags (
  id uuid primary key default gen_random_uuid(),
  location_id uuid not null references public.locations(id) on delete cascade,
  tag_id uuid not null references public.tags(id),
  motivation text,
  score int not null default 0,
  total_votes int not null default 0,
  hidden_at timestamptz,
  unique (location_id, tag_id)
);

-- Votes
create table public.votes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id),
  location_tag_id uuid not null references public.location_tags(id) on delete cascade,
  vote_type vote_type not null,
  created_at timestamptz not null default now(),
  unique (user_id, location_tag_id)
);

-- Waitlist signups for coming-soon cities
create table public.waitlist_signups (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  city_id uuid not null references public.cities(id),
  search_context text,
  created_at timestamptz not null default now()
);

-- Indexes
create index idx_locations_city on public.locations(city_id);
create index idx_locations_status on public.locations(status);
create index idx_locations_submitted_by on public.locations(submitted_by);
create index idx_location_tags_location on public.location_tags(location_id);
create index idx_location_tags_tag on public.location_tags(tag_id);
create index idx_votes_location_tag on public.votes(location_tag_id);
create index idx_votes_user on public.votes(user_id);

-- RLS Policies
alter table public.users enable row level security;
alter table public.cities enable row level security;
alter table public.locations enable row level security;
alter table public.tags enable row level security;
alter table public.location_tags enable row level security;
alter table public.votes enable row level security;
alter table public.waitlist_signups enable row level security;

-- Everyone can read cities and tags
create policy "Cities are readable by everyone" on public.cities for select using (true);
create policy "Tags are readable by everyone" on public.tags for select using (true);

-- Approved locations are public, pending visible to submitter and admins
create policy "Approved locations are public" on public.locations
  for select using (status = 'approved');
create policy "Users see own submissions" on public.locations
  for select using (auth.uid() = submitted_by);
create policy "Users can insert locations" on public.locations
  for insert with check (auth.uid() = submitted_by);

-- Location tags: visible if location is approved and tag not hidden
create policy "Visible location tags" on public.location_tags
  for select using (
    hidden_at is null
    and exists (
      select 1 from public.locations
      where locations.id = location_tags.location_id
      and locations.status = 'approved'
    )
  );

-- Users can read their own profile, update their own
create policy "Users read own profile" on public.users
  for select using (auth.uid() = id);
create policy "Public profile data" on public.users
  for select using (true);
create policy "Users update own profile" on public.users
  for update using (auth.uid() = id);
create policy "Users insert own profile" on public.users
  for insert with check (auth.uid() = id);

-- Votes: users can manage their own
create policy "Users read own votes" on public.votes
  for select using (auth.uid() = user_id);
create policy "Users insert votes" on public.votes
  for insert with check (auth.uid() = user_id);
create policy "Users update own votes" on public.votes
  for update using (auth.uid() = user_id);

-- Waitlist: anyone can insert
create policy "Anyone can sign up for waitlist" on public.waitlist_signups
  for insert with check (true);

-- Scout promotion trigger: auto-promote to scout at 5 approved locations
create or replace function public.handle_location_approval()
returns trigger as $$
begin
  if new.status = 'approved' and (old.status is null or old.status != 'approved') then
    update public.users
    set approved_count = approved_count + 1
    where id = new.submitted_by;

    update public.users
    set role = 'scout'
    where id = new.submitted_by
    and approved_count >= 5
    and role = 'visitor';
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_location_approved
  after update of status on public.locations
  for each row
  execute function public.handle_location_approval();

-- Auto-approve for scouts
create or replace function public.handle_scout_submission()
returns trigger as $$
declare
  submitter_role user_role;
begin
  select role into submitter_role from public.users where id = new.submitted_by;
  if submitter_role = 'scout' or submitter_role = 'admin' then
    new.status := 'approved';
    new.approved_at := now();
  end if;
  return new;
end;
$$ language plpgsql security definer;

create trigger on_location_insert
  before insert on public.locations
  for each row
  execute function public.handle_scout_submission();

-- Vote score update trigger
create or replace function public.handle_vote_change()
returns trigger as $$
begin
  update public.location_tags
  set
    total_votes = (select count(*) from public.votes where location_tag_id = coalesce(new.location_tag_id, old.location_tag_id)),
    score = (
      select coalesce(sum(case when vote_type = 'up' then 1 else -1 end), 0)
      from public.votes
      where location_tag_id = coalesce(new.location_tag_id, old.location_tag_id)
    )
  where id = coalesce(new.location_tag_id, old.location_tag_id);

  -- Auto-hide tag if threshold met
  update public.location_tags
  set hidden_at = now()
  where id = coalesce(new.location_tag_id, old.location_tag_id)
  and total_votes >= 10
  and score::float / nullif(total_votes, 0) < -0.4
  and hidden_at is null;

  return coalesce(new, old);
end;
$$ language plpgsql security definer;

create trigger on_vote_insert
  after insert on public.votes
  for each row
  execute function public.handle_vote_change();

create trigger on_vote_update
  after update on public.votes
  for each row
  execute function public.handle_vote_change();

-- Seed Amsterdam
insert into public.cities (name, slug, status, live_since)
values ('Amsterdam', 'amsterdam', 'live', now());

-- Seed coming-soon cities
insert into public.cities (name, slug, status) values
  ('Utrecht', 'utrecht', 'coming_soon'),
  ('Rotterdam', 'rotterdam', 'coming_soon'),
  ('Den Haag', 'den-haag', 'coming_soon'),
  ('Eindhoven', 'eindhoven', 'coming_soon');
