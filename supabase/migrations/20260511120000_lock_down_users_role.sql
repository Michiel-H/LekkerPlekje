-- [CRITICAL] Prevent users from self-escalating their role via update.
--
-- The previous policy was `USING (id = auth.uid())` with no WITH CHECK,
-- which let any authenticated user run
--   supabase.from('users').update({ role: 'admin' }).eq('id', myId)
-- and become an admin. We lock it down by requiring the new role to equal
-- the existing role for self-updates. Role changes are now only possible
-- via SECURITY DEFINER functions (or service-role calls from API routes).

drop policy if exists "Users can update own profile" on public.users;

create policy "Users can update own profile" on public.users
  for update
  using (id = auth.uid())
  with check (
    id = auth.uid()
    and role = (select role from public.users where id = auth.uid())
    and approved_count = (select approved_count from public.users where id = auth.uid())
  );

-- Admins (and the service role) bypass the above via a separate policy.
drop policy if exists "Admins can update any user" on public.users;
create policy "Admins can update any user" on public.users
  for update
  using (public.get_user_role() in ('admin', 'superadmin'));
