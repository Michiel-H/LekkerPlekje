-- [CRITICAL] Fix the Toppertje promotion and auto-publish triggers.
--
-- The previous functions referenced status 'approved' and role 'visitor'.
-- Neither value exists in the actual enums:
--   location_status = ('pending','published','rejected')
--   user_role       = ('user','toppertje','admin','superadmin')
-- The result: nobody ever got promoted, and admin/toppertje submissions
-- were not actually auto-publishing.

create or replace function public.handle_location_approval()
returns trigger as $$
begin
  if new.status = 'published'
     and (old.status is null or old.status <> 'published') then
    update public.users
       set approved_count = approved_count + 1
     where id = new.submitted_by;

    update public.users
       set role = 'toppertje'
     where id = new.submitted_by
       and approved_count >= 5
       and role = 'user';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_location_published on public.locations;
create trigger on_location_published
  after update on public.locations
  for each row
  execute function public.handle_location_approval();

create or replace function public.handle_toppertje_submission()
returns trigger as $$
declare
  submitter_role public.user_role;
begin
  select role into submitter_role
    from public.users where id = new.submitted_by;
  if submitter_role in ('toppertje', 'admin', 'superadmin') then
    new.status := 'published';
    new.approved_at := now();
    new.approved_by := new.submitted_by;
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_location_insert on public.locations;
create trigger on_location_insert
  before insert on public.locations
  for each row
  execute function public.handle_toppertje_submission();
