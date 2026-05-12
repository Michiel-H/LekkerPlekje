-- [MEDIUM] Lightweight rate limits enforced in the DB so a scripted
-- client can't spam submissions or votes. Numbers are deliberately
-- generous so the friend-and-family soft-launch isn't friction.

create or replace function public.rate_limit_submissions()
returns trigger as $$
declare
  recent_count int;
begin
  -- Max 5 location submissions per user per 10 minutes.
  select count(*) into recent_count
    from public.locations
   where submitted_by = new.submitted_by
     and created_at > now() - interval '10 minutes';
  if recent_count >= 5 then
    raise exception 'Too many submissions in a short window — wacht even.'
      using errcode = '22023';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists rate_limit_submissions on public.locations;
create trigger rate_limit_submissions
  before insert on public.locations
  for each row execute function public.rate_limit_submissions();

create or replace function public.rate_limit_votes()
returns trigger as $$
declare
  recent_count int;
begin
  -- Max 60 votes per user per minute (more than fast enough for a real human).
  select count(*) into recent_count
    from public.votes
   where user_id = new.user_id
     and created_at > now() - interval '1 minute';
  if recent_count >= 60 then
    raise exception 'Te veel stemmen achter elkaar — even pauzeren.'
      using errcode = '22023';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists rate_limit_votes on public.votes;
create trigger rate_limit_votes
  before insert on public.votes
  for each row execute function public.rate_limit_votes();
