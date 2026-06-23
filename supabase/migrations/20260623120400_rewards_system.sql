-- =========================================================
-- Rewards system — points, levels, badges, streaks, leaderboard
-- =========================================================

-- ===== user reward state =====
alter table public.users
  add column if not exists points          int not null default 0,
  add column if not exists level           int not null default 0,
  add column if not exists current_streak  int not null default 0,
  add column if not exists longest_streak  int not null default 0,
  add column if not exists last_active_on  date;

-- ===== append-only points ledger (idempotent & auditable) =====
create table if not exists public.point_events (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references public.users(id) on delete cascade,
  kind       text not null,
  points     int  not null,
  ref_id     uuid,
  city_id    uuid references public.cities(id),
  created_at timestamptz not null default now(),
  unique (user_id, kind, ref_id)
);
create index if not exists point_events_user_idx on public.point_events(user_id);
create index if not exists point_events_period_idx on public.point_events(created_at);
create index if not exists point_events_city_idx on public.point_events(city_id);

-- ===== badges =====
create table if not exists public.badges (
  slug text primary key,
  name text not null,
  description text not null,
  emoji text not null,
  sort_order int not null default 0
);
create table if not exists public.user_badges (
  user_id  uuid not null references public.users(id) on delete cascade,
  badge_slug text not null references public.badges(slug),
  earned_at timestamptz not null default now(),
  primary key (user_id, badge_slug)
);

insert into public.badges (slug, name, description, emoji, sort_order) values
  ('pionier',    'Pionier',    'Eerste goedgekeurde plekje in een stad.',      '🚩', 1),
  ('fotograaf',  'Fotograaf',  '10 plekjes met foto toegevoegd.',              '📸', 2),
  ('smaakmaker', 'Smaakmaker', 'Een plekje van jou bereikte 50 duimpjes.',     '😋', 3),
  ('vaste-gast', 'Vaste gast', '30 dagen op rij actief.',                      '🔥', 4),
  ('stadskenner','Stadskenner','10 goedgekeurde plekjes in één stad.',         '🏙️', 5)
on conflict (slug) do nothing;

-- ===== RLS =====
alter table public.point_events enable row level security;
create policy "own point_events - select"
  on public.point_events for select using (auth.uid() = user_id);

alter table public.badges enable row level security;
create policy "badges - public read" on public.badges for select using (true);
alter table public.user_badges enable row level security;
create policy "user_badges - public read" on public.user_badges for select using (true);

-- =========================================================
-- Core functions
-- =========================================================

-- Map points total -> level index (keep in sync with src/lib/rewards.ts).
create or replace function public.level_for_points(p int)
returns int
language sql
immutable
set search_path = public, pg_temp
as $$
  select case
    when p >= 2000 then 4
    when p >=  750 then 3
    when p >=  400 then 2
    when p >=  100 then 1
    else 0
  end;
$$;

-- Enqueue a reward notification (no-op safe if queue absent).
create or replace function public.enqueue_reward_notification(
  p_user uuid, p_title text, p_body text, p_url text, p_dedupe text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  insert into public.notification_queue(user_id, category, payload, dedupe_key)
  values (p_user, 'reward',
    jsonb_build_object('title', p_title, 'body', p_body, 'url', p_url, 'tag', p_dedupe),
    p_dedupe)
  on conflict (dedupe_key) do nothing;
end;
$$;

-- Idempotently grant a badge; notify on first grant.
create or replace function public.grant_badge(p_user uuid, p_slug text)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_name text; v_emoji text;
begin
  insert into public.user_badges(user_id, badge_slug)
  values (p_user, p_slug)
  on conflict do nothing;
  if not found then return; end if;

  select name, emoji into v_name, v_emoji from public.badges where slug = p_slug;
  perform public.enqueue_reward_notification(
    p_user,
    'Nieuwe badge: ' || v_name || ' ' || v_emoji,
    'Je hebt de badge ‘' || v_name || '’ verdiend!',
    '/profiel',
    'badge-' || p_user || '-' || p_slug);
end;
$$;

-- Update the daily streak; grant Vaste gast at 30 days.
create or replace function public.touch_streak(p_user uuid)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_last date; v_streak int;
begin
  select last_active_on, current_streak into v_last, v_streak
    from public.users where id = p_user;

  if v_last = current_date then
    return;
  elsif v_last = current_date - 1 then
    v_streak := coalesce(v_streak, 0) + 1;
  else
    v_streak := 1;
  end if;

  update public.users
     set current_streak = v_streak,
         longest_streak = greatest(longest_streak, v_streak),
         last_active_on = current_date
   where id = p_user;

  if v_streak >= 30 then
    perform public.grant_badge(p_user, 'vaste-gast');
  end if;
end;
$$;

-- Award points idempotently, recompute level, touch streak, notify on level-up.
create or replace function public.award_points(
  p_user uuid, p_kind text, p_points int, p_ref uuid, p_city uuid default null)
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_points int; v_old int; v_new int;
begin
  if p_user is null then return; end if;

  insert into public.point_events(user_id, kind, points, ref_id, city_id)
  values (p_user, p_kind, p_points, p_ref, p_city)
  on conflict (user_id, kind, ref_id) do nothing;
  if not found then return; end if;

  select level into v_old from public.users where id = p_user;
  update public.users set points = points + p_points
    where id = p_user returning points into v_points;

  v_new := public.level_for_points(v_points);
  if v_new <> v_old then
    update public.users set level = v_new where id = p_user;
    perform public.enqueue_reward_notification(
      p_user, 'Level omhoog! 🎉',
      'Je bent nu level ' || v_new || ' op LekkerPlekje.',
      '/profiel', 'levelup-' || p_user || '-' || v_new);
  end if;

  perform public.touch_streak(p_user);
end;
$$;

-- Profile completion: awarded for the caller only, when their profile is complete.
create or replace function public.complete_profile()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare uid uuid := auth.uid(); v_ok boolean;
begin
  if uid is null then return; end if;
  select (display_name is not null
          and avatar_url is not null
          and coalesce(bio, '') <> ''
          and preferred_city_id is not null)
    into v_ok
    from public.users where id = uid;
  if coalesce(v_ok, false) then
    perform public.award_points(uid, 'profile_complete', 15, uid, null);
  end if;
end;
$$;

-- =========================================================
-- Wire points into existing events
-- =========================================================

-- Spot approval — merged: approved_count + toppertje + notifications + rewards.
create or replace function public.handle_location_approval()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_count int;
  v_role  public.user_role;
  v_city_count int;
  v_photo_count int;
begin
  if new.status = 'published'
     and (old.status is null or old.status <> 'published') then

    update public.users
       set approved_count = approved_count + 1
     where id = new.submitted_by
     returning approved_count, role into v_count, v_role;

    update public.users set role = 'toppertje'
     where id = new.submitted_by and approved_count >= 5 and role = 'user';

    -- ----- Notifications -----
    insert into public.notification_queue(user_id, category, payload, dedupe_key)
    values (new.submitted_by, 'spot_approved',
      jsonb_build_object('title','Je plekje is goedgekeurd! 🎉',
        'body', new.name || ' staat nu live op LekkerPlekje.',
        'url','/plekje/'||new.id, 'tag','approved-'||new.id),
      'approved-'||new.id)
    on conflict (dedupe_key) do nothing;

    if v_count = 4 and v_role = 'user' then
      insert into public.notification_queue(user_id, category, payload, dedupe_key)
      values (new.submitted_by, 'almost_toppertje',
        jsonb_build_object('title','Nog 1 plekje tot Toppertje! 🏆',
          'body','Voeg nog één goedgekeurd plekje toe en je wordt Toppertje.',
          'url','/toevoegen', 'tag','almost-topper'),
        'almost-topper-'||new.submitted_by||'-'||v_count)
      on conflict (dedupe_key) do nothing;
    end if;

    -- ----- Rewards -----
    perform public.award_points(new.submitted_by, 'spot_published', 25, new.id, new.city_id);
    if new.image_url is not null then
      perform public.award_points(new.submitted_by, 'photo_added', 10, new.id, new.city_id);
    end if;

    -- Pionier: first published spot in this city
    select count(*) into v_city_count
      from public.locations
     where city_id = new.city_id and status = 'published';
    if v_city_count = 1 then
      perform public.grant_badge(new.submitted_by, 'pionier');
    end if;

    -- Stadskenner: 10 published spots by this user in one city
    select count(*) into v_city_count
      from public.locations
     where city_id = new.city_id and status = 'published' and submitted_by = new.submitted_by;
    if v_city_count >= 10 then
      perform public.grant_badge(new.submitted_by, 'stadskenner');
    end if;

    -- Fotograaf: 10 published spots with a photo
    select count(*) into v_photo_count
      from public.locations
     where submitted_by = new.submitted_by and status = 'published' and image_url is not null;
    if v_photo_count >= 10 then
      perform public.grant_badge(new.submitted_by, 'fotograaf');
    end if;
  end if;
  return new;
end;
$$;

-- Voting — award voter (+1) and spot owner (+2 on upvote, never self).
create or replace function public.award_vote_points()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_owner uuid; v_city uuid;
begin
  perform public.award_points(new.user_id, 'vote_cast', 1, new.id);

  if new.vote_type = 'up' then
    select l.submitted_by, l.city_id into v_owner, v_city
      from public.location_tags lt
      join public.locations l on l.id = lt.location_id
     where lt.id = new.location_tag_id and l.status = 'published';
    if v_owner is not null and v_owner <> new.user_id then
      perform public.award_points(v_owner, 'upvote_received', 2, new.id, v_city);
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists on_vote_award on public.votes;
create trigger on_vote_award
  after insert on public.votes
  for each row execute function public.award_vote_points();

-- Smaakmaker — extend the milestone trigger to grant the badge at 50 upvotes.
create or replace function public.notify_location_milestone()
returns trigger
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_total int;
  v_owner uuid;
  v_name  text;
  m       int;
  milestones int[] := array[10, 25, 50, 100, 250];
begin
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

      if m = 50 then
        perform public.grant_badge(v_owner, 'smaakmaker');
      end if;
    end if;
  end loop;
  return new;
end;
$$;

-- =========================================================
-- Leaderboard — SECURITY DEFINER, never exposes the ledger.
-- =========================================================
create or replace function public.get_leaderboard(
  p_period text default 'month',
  p_city uuid default null,
  p_limit int default 50)
returns table (user_id uuid, display_name text, level int, points int)
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if p_period = 'all' and p_city is null then
    return query
      select u.id, u.display_name, u.level, u.points
        from public.users u
       where u.banned_at is null and u.points > 0
       order by u.points desc
       limit p_limit;
  else
    return query
      select u.id, u.display_name, u.level, coalesce(sum(pe.points),0)::int as points
        from public.point_events pe
        join public.users u on u.id = pe.user_id and u.banned_at is null
       where (p_period <> 'month' or pe.created_at >= date_trunc('month', now()))
         and (p_city is null or pe.city_id = p_city)
       group by u.id, u.display_name, u.level
       having coalesce(sum(pe.points),0) > 0
       order by points desc
       limit p_limit;
  end if;
end;
$$;

-- =========================================================
-- Hardening — lock internal functions to definer/trigger use; expose only
-- the two client-facing RPCs (get_leaderboard, complete_profile).
-- =========================================================
revoke execute on function public.enqueue_reward_notification(uuid, text, text, text, text) from public, anon, authenticated;
revoke execute on function public.grant_badge(uuid, text)                                   from public, anon, authenticated;
revoke execute on function public.touch_streak(uuid)                                        from public, anon, authenticated;
revoke execute on function public.award_points(uuid, text, int, uuid, uuid)                 from public, anon, authenticated;
revoke execute on function public.handle_location_approval()                                from public, anon, authenticated;
revoke execute on function public.award_vote_points()                                       from public, anon, authenticated;
revoke execute on function public.notify_location_milestone()                               from public, anon, authenticated;

-- Client RPCs: complete_profile (signed-in only) + get_leaderboard (public read).
revoke execute on function public.complete_profile()                            from public, anon;
grant  execute on function public.complete_profile()                            to authenticated;
grant  execute on function public.get_leaderboard(text, uuid, int)              to anon, authenticated;
