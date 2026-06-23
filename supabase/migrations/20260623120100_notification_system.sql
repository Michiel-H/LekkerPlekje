-- =========================================================
-- Notification queue: producers insert, dispatcher consumes
-- =========================================================
create table if not exists public.notification_queue (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  category    text not null,          -- spot_approved|almost_toppertje|upvote_milestone|city_live|digest|reengage
  payload     jsonb not null,         -- { title, body, url, tag, icon? }
  dedupe_key  text unique,            -- guarantees we never enqueue the same thing twice
  status      text not null default 'pending',  -- pending|sent|skipped|failed
  attempts    int  not null default 0,
  created_at  timestamptz not null default now(),
  sent_at     timestamptz
);
create index if not exists notification_queue_pending_idx
  on public.notification_queue(status, created_at) where status = 'pending';
create index if not exists notification_queue_user_sent_idx
  on public.notification_queue(user_id, sent_at);

-- Tracks which popularity milestones a location has already fired (no double pings)
create table if not exists public.location_milestones (
  location_id uuid not null references public.locations(id) on delete cascade,
  milestone   int  not null,
  notified_at timestamptz not null default now(),
  primary key (location_id, milestone)
);

-- Per-user notification preferences (default everything on)
alter table public.users
  add column if not exists notif_spot_approved boolean not null default true,
  add column if not exists notif_milestones    boolean not null default true,
  add column if not exists notif_city_news      boolean not null default true,
  add column if not exists notif_digest         boolean not null default true,
  add column if not exists notif_reengage       boolean not null default true;

-- =========================================================
-- RLS: these tables are SERVER-ONLY. Enable RLS and add NO
-- policies, so the anon/auth keys can't read or write them;
-- only the service-role key (dispatcher/producers) bypasses RLS.
-- =========================================================
alter table public.notification_queue enable row level security;
alter table public.location_milestones enable row level security;

-- =========================================================
-- Trigger: upvote milestone (popularity)
-- =========================================================
create or replace function public.notify_location_milestone()
returns trigger as $$
declare
  v_total int;
  v_owner uuid;
  v_name  text;
  m       int;
  milestones int[] := array[10, 25, 50, 100, 250];
begin
  -- Only react when the positive score actually changed.
  if tg_op = 'UPDATE' and new.score = old.score then
    return new;
  end if;

  select coalesce(sum(score), 0) into v_total
    from public.location_tags where location_id = new.location_id;

  select submitted_by, name into v_owner, v_name
    from public.locations where id = new.location_id and status = 'published';
  if v_owner is null then return new; end if;

  foreach m in array milestones loop
    if v_total >= m and not exists (
         select 1 from public.location_milestones
          where location_id = new.location_id and milestone = m) then
      insert into public.location_milestones(location_id, milestone)
      values (new.location_id, m);

      insert into public.notification_queue(user_id, category, payload, dedupe_key)
      values (
        v_owner, 'upvote_milestone',
        jsonb_build_object(
          'title', v_name || ' is populair! 🔥',
          'body',  'Je plekje heeft al ' || m || ' duimpjes omhoog.',
          'url',   '/plekje/' || new.location_id,
          'tag',   'milestone-' || new.location_id),
        'milestone-' || new.location_id || '-' || m)
      on conflict (dedupe_key) do nothing;
    end if;
  end loop;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_location_tag_score_change on public.location_tags;
create trigger on_location_tag_score_change
  after update of score on public.location_tags
  for each row execute function public.notify_location_milestone();

-- =========================================================
-- Trigger: spot approved + almost-toppertje
-- (replaces the existing handle_location_approval)
-- =========================================================
create or replace function public.handle_location_approval()
returns trigger as $$
declare
  v_count int;
  v_role  public.user_role;
begin
  if new.status = 'published'
     and (old.status is null or old.status <> 'published') then

    update public.users
       set approved_count = approved_count + 1
     where id = new.submitted_by
     returning approved_count, role into v_count, v_role;

    -- Promote at 5 approved (unchanged behaviour)
    update public.users
       set role = 'toppertje'
     where id = new.submitted_by
       and approved_count >= 5
       and role = 'user';

    -- Enqueue: your plekje is live
    insert into public.notification_queue(user_id, category, payload, dedupe_key)
    values (new.submitted_by, 'spot_approved',
      jsonb_build_object(
        'title', 'Je plekje is goedgekeurd! 🎉',
        'body',  new.name || ' staat nu live op LekkerPlekje.',
        'url',   '/plekje/' || new.id,
        'tag',   'approved-' || new.id),
      'approved-' || new.id)
    on conflict (dedupe_key) do nothing;

    -- Enqueue: one approval away from Toppertje
    if v_count = 4 and v_role = 'user' then
      insert into public.notification_queue(user_id, category, payload, dedupe_key)
      values (new.submitted_by, 'almost_toppertje',
        jsonb_build_object(
          'title', 'Nog 1 plekje tot Toppertje! 🏆',
          'body',  'Voeg nog één goedgekeurd plekje toe en je wordt Toppertje.',
          'url',   '/toevoegen',
          'tag',   'almost-topper'),
        'almost-topper-' || new.submitted_by || '-' || v_count)
      on conflict (dedupe_key) do nothing;
    end if;
  end if;
  return new;
end;
$$ language plpgsql security definer;
-- Trigger on_location_published already exists from earlier migrations; no need to recreate.

-- =========================================================
-- Trigger: city goes live
-- =========================================================
create or replace function public.notify_city_live()
returns trigger as $$
begin
  if new.status = 'live' and old.status = 'coming_soon' then
    insert into public.notification_queue(user_id, category, payload, dedupe_key)
    select distinct u.id, 'city_live',
      jsonb_build_object(
        'title', new.name || ' is nu live! 🎉',
        'body',  'Ontdek de lekkerste plekjes in ' || new.name || '.',
        'url',   '/' || new.slug,
        'tag',   'city-live-' || new.id),
      'city-live-' || new.id || '-' || u.id
    from public.users u
    where u.banned_at is null
      and exists (
        select 1
          from public.locations l
          left join public.favorites f on f.location_id = l.id
         where l.city_id = new.id
           and (l.submitted_by = u.id or f.user_id = u.id)
      )
    on conflict (dedupe_key) do nothing;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_city_go_live on public.cities;
create trigger on_city_go_live
  after update of status on public.cities
  for each row execute function public.notify_city_live();

-- =========================================================
-- Scheduled producer: weekly digest
-- =========================================================
create or replace function public.enqueue_weekly_digests()
returns int as $$
declare v_count int;
begin
  with interest as (
    select distinct l.submitted_by as user_id, l.city_id
      from public.locations l where l.submitted_by is not null
    union
    select distinct f.user_id, l.city_id
      from public.favorites f join public.locations l on l.id = f.location_id
  ),
  fresh as (
    select i.user_id, c.name as city_name, c.slug, count(*) as n
      from interest i
      join public.cities c    on c.id = i.city_id and c.status = 'live'
      join public.locations l on l.city_id = i.city_id
                             and l.status = 'published'
                             and l.created_at > now() - interval '7 days'
      join public.users u     on u.id = i.user_id and u.banned_at is null
     group by i.user_id, c.name, c.slug
     having count(*) > 0
  )
  insert into public.notification_queue(user_id, category, payload, dedupe_key)
  select f.user_id, 'digest',
    jsonb_build_object(
      'title', f.n || ' nieuwe plekjes in ' || f.city_name,
      'body',  'Bekijk de nieuwste lekkere plekjes van deze week.',
      'url',   '/' || f.slug,
      'tag',   'digest-' || to_char(now(),'IYYY-IW')),
    'digest-' || f.user_id || '-' || f.slug || '-' || to_char(now(),'IYYY-IW')
  from fresh f
  on conflict (dedupe_key) do nothing;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$ language plpgsql security definer;

-- =========================================================
-- Scheduled producer: re-engagement (inactive 14–90 days)
-- =========================================================
create or replace function public.enqueue_reengagement()
returns int as $$
declare v_count int;
begin
  with last_activity as (
    select u.id as user_id,
      greatest(
        coalesce((select max(created_at) from public.votes v     where v.user_id = u.id),      'epoch'::timestamptz),
        coalesce((select max(created_at) from public.favorites f  where f.user_id = u.id),      'epoch'::timestamptz),
        coalesce((select max(created_at) from public.locations l  where l.submitted_by = u.id), 'epoch'::timestamptz),
        u.created_at
      ) as last_seen
    from public.users u
    where u.banned_at is null
  )
  insert into public.notification_queue(user_id, category, payload, dedupe_key)
  select la.user_id, 'reengage',
    jsonb_build_object(
      'title', 'We hebben je gemist! 👋',
      'body',  'Er staan nieuwe lekkere plekjes voor je klaar.',
      'url',   '/',
      'tag',   'reengage'),
    'reengage-' || la.user_id || '-' || to_char(now(),'IYYY-MM')
  from last_activity la
  where la.last_seen < now() - interval '14 days'
    and la.last_seen > now() - interval '90 days'
  on conflict (dedupe_key) do nothing;
  get diagnostics v_count = row_count;
  return v_count;
end;
$$ language plpgsql security definer;
