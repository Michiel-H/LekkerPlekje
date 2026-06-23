-- One-off rewards backfill (run once via MCP/SQL editor, NOT part of the
-- migration chain). Awards points/badges for data that existed before the
-- rewards system launched.
--
-- It writes the ledger + recomputes users.points/level + grants badges DIRECTLY
-- (not via award_points/grant_badge) so it does NOT enqueue a flood of
-- retroactive level-up / badge push notifications, and does NOT touch streaks.
-- Idempotent: re-running is a no-op (point_events unique constraint + on conflict).

-- 1. Published spots → spot_published (+25) and photo bonus (+10).
insert into public.point_events (user_id, kind, points, ref_id, city_id)
select submitted_by, 'spot_published', 25, id, city_id
from public.locations
where status = 'published' and submitted_by is not null
on conflict (user_id, kind, ref_id) do nothing;

insert into public.point_events (user_id, kind, points, ref_id, city_id)
select submitted_by, 'photo_added', 10, id, city_id
from public.locations
where status = 'published' and submitted_by is not null and image_url is not null
on conflict (user_id, kind, ref_id) do nothing;

-- 2. Votes → vote_cast (+1 voter) and upvote_received (+2 owner, never self).
insert into public.point_events (user_id, kind, points, ref_id, city_id)
select user_id, 'vote_cast', 1, id, null
from public.votes
on conflict (user_id, kind, ref_id) do nothing;

insert into public.point_events (user_id, kind, points, ref_id, city_id)
select l.submitted_by, 'upvote_received', 2, v.id, l.city_id
from public.votes v
join public.location_tags lt on lt.id = v.location_tag_id
join public.locations l on l.id = lt.location_id and l.status = 'published'
where v.vote_type = 'up' and l.submitted_by is not null and l.submitted_by <> v.user_id
on conflict (user_id, kind, ref_id) do nothing;

-- 3. Recompute the denormalised totals on users.
update public.users u
set points = coalesce(pe.total, 0),
    level  = public.level_for_points(coalesce(pe.total, 0))
from (select user_id, sum(points)::int as total from public.point_events group by user_id) pe
where pe.user_id = u.id;

-- 4. Badges (direct grant, no push).
insert into public.user_badges (user_id, badge_slug)
select distinct on (city_id) submitted_by, 'pionier'
from public.locations
where status = 'published' and submitted_by is not null
order by city_id, created_at asc
on conflict do nothing;

insert into public.user_badges (user_id, badge_slug)
select submitted_by, 'stadskenner'
from public.locations
where status = 'published' and submitted_by is not null
group by submitted_by, city_id
having count(*) >= 10
on conflict do nothing;

insert into public.user_badges (user_id, badge_slug)
select submitted_by, 'fotograaf'
from public.locations
where status = 'published' and submitted_by is not null and image_url is not null
group by submitted_by
having count(*) >= 10
on conflict do nothing;

insert into public.user_badges (user_id, badge_slug)
select distinct l.submitted_by, 'smaakmaker'
from public.locations l
where l.status = 'published' and l.submitted_by is not null
  and (select coalesce(sum(score),0) from public.location_tags where location_id = l.id) >= 50
on conflict do nothing;

-- 5. Seed already-crossed popularity milestones so the next vote on an old
--    popular spot doesn't fire a burst of retroactive milestone pushes.
insert into public.location_milestones (location_id, milestone)
select l.id, m.milestone
from public.locations l
cross join (values (10), (25), (50), (100), (250)) as m(milestone)
where l.status = 'published'
  and (select coalesce(sum(score),0) from public.location_tags where location_id = l.id) >= m.milestone
on conflict do nothing;
