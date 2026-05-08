-- Recreate handle_location_approval
create or replace function public.handle_location_approval()
returns trigger as $$
begin
  if new.status = 'approved' and (old.status is null or old.status != 'approved') then
    update public.users
    set approved_count = approved_count + 1
    where id = new.submitted_by;

    update public.users
    set role = 'toppertje'
    where id = new.submitted_by
    and approved_count >= 5
    and role = 'visitor';
  end if;
  return new;
end;
$$ language plpgsql security definer;

-- Recreate handle_toppertje_submission (and drop old one if needed)
create or replace function public.handle_toppertje_submission()
returns trigger as $$
declare
  submitter_role user_role;
begin
  select role into submitter_role from public.users where id = new.submitted_by;
  if submitter_role = 'toppertje' or submitter_role = 'admin' then
    new.status := 'approved';
    new.approved_at := now();
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_location_insert on public.locations;

create trigger on_location_insert
  before insert on public.locations
  for each row
  execute function public.handle_toppertje_submission();
  
drop function if exists public.handle_scout_submission;
