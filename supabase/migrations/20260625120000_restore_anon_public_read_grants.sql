-- Restore the grants the public (logged-out) site needs.
--
-- 20260511120700_function_hardening.sql revoked EXECUTE on public.get_user_role()
-- from anon, assuming it wouldn't affect RLS. It does: an anonymous SELECT on
-- public.locations evaluates ALL permissive SELECT policies, including
-- "Admins can read all locations", which calls get_user_role(). Without EXECUTE,
-- anon's read throws "permission denied for function get_user_role", so the
-- homepage / resultaten / plekje / city pages render no plekjes for logged-out
-- visitors. The function is SECURITY DEFINER and only returns the caller's own
-- role (WHERE id = auth.uid()); for anon auth.uid() is null, so it leaks nothing.
grant execute on function public.get_user_role() to anon;

-- The public pages embed the submitter's public profile
-- (users: display_name, pronoun, role, points) and signup checks display_name
-- for uniqueness as anon. Reads are gated by the existing "Public read access
-- for users" RLS policy. Scope the grant to public identity columns so
-- sensitive fields (notif_*, banned_at, bio, streaks, last_active_on,
-- preferred_city_id, level) stay private even though RLS would otherwise allow
-- them through.
grant select (id, display_name, pronoun, role, points, avatar_url)
  on public.users to anon;
