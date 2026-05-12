-- [HIGH] Audit log for admin moderation actions.
--
-- Every admin write (approve/reject location, edit/delete, role change)
-- must be recorded so we can trace abuse, satisfy AVG audit requests,
-- and recover from a compromised admin account.

create table if not exists public.admin_audit_log (
  id           uuid primary key default gen_random_uuid(),
  admin_id     uuid not null references public.users(id) on delete set null,
  action       text not null,
  target_type  text not null,
  target_id    uuid,
  metadata     jsonb,
  created_at   timestamptz not null default now()
);

create index if not exists admin_audit_log_admin_id_idx on public.admin_audit_log(admin_id);
create index if not exists admin_audit_log_created_at_idx on public.admin_audit_log(created_at desc);
create index if not exists admin_audit_log_target_idx on public.admin_audit_log(target_type, target_id);

alter table public.admin_audit_log enable row level security;

drop policy if exists "Admins can read audit log" on public.admin_audit_log;
drop policy if exists "Admins can insert audit log" on public.admin_audit_log;
create policy "Admins can read audit log" on public.admin_audit_log
  for select using (public.get_user_role() in ('admin', 'superadmin'));
create policy "Admins can insert audit log" on public.admin_audit_log
  for insert with check (public.get_user_role() in ('admin', 'superadmin'));
