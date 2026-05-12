-- [HIGH] Keep location_tags.score and total_votes in sync with the votes
-- table, and auto-hide a tag once 10+ votes have been cast and it's >70% negative.
--
-- The previous app code read these aggregate columns but nothing kept them
-- up to date — every plekje detail page showed "0 / 0" forever.

create or replace function public.refresh_location_tag_aggregates(p_location_tag_id uuid)
returns void as $$
declare
  v_up    int;
  v_total int;
  v_hide  boolean;
begin
  select
    count(*) filter (where vote_type = 'up'),
    count(*)
    into v_up, v_total
    from public.votes
   where location_tag_id = p_location_tag_id;

  -- Auto-hide once we have at least 10 votes and >70% are 'down'.
  v_hide := v_total >= 10 and (v_total - v_up)::numeric / v_total > 0.7;

  update public.location_tags
     set score       = v_up,
         total_votes = v_total,
         hidden_at   = case
                         when v_hide then coalesce(hidden_at, now())
                         else null
                       end
   where id = p_location_tag_id;
end;
$$ language plpgsql security definer;

create or replace function public.handle_vote_change()
returns trigger as $$
begin
  if tg_op = 'DELETE' then
    perform public.refresh_location_tag_aggregates(old.location_tag_id);
    return old;
  end if;

  perform public.refresh_location_tag_aggregates(new.location_tag_id);

  -- If a vote row was moved from one location_tag to another (rare), refresh both.
  if tg_op = 'UPDATE' and new.location_tag_id <> old.location_tag_id then
    perform public.refresh_location_tag_aggregates(old.location_tag_id);
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_vote_insert on public.votes;
drop trigger if exists on_vote_update on public.votes;
drop trigger if exists on_vote_delete on public.votes;

create trigger on_vote_insert
  after insert on public.votes
  for each row execute function public.handle_vote_change();

create trigger on_vote_update
  after update on public.votes
  for each row execute function public.handle_vote_change();

create trigger on_vote_delete
  after delete on public.votes
  for each row execute function public.handle_vote_change();
