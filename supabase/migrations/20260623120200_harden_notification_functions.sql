-- [SECURITY HARDENING] Apply the same treatment as function_hardening to the
-- notification functions. `create or replace` in the previous migration reset
-- the pinned search_path (regressing handle_location_approval) and restored the
-- default PUBLIC EXECUTE grant, exposing them over PostgREST.

-- 1. Pin search_path on every SECURITY DEFINER function we just (re)created.
alter function public.handle_location_approval()  set search_path = public, pg_temp;
alter function public.notify_location_milestone()  set search_path = public, pg_temp;
alter function public.notify_city_live()           set search_path = public, pg_temp;
alter function public.enqueue_weekly_digests()     set search_path = public, pg_temp;
alter function public.enqueue_reengagement()       set search_path = public, pg_temp;

-- 2. Trigger-only functions: take away the default PUBLIC EXECUTE grant so they
--    aren't callable as REST RPC. Triggers still fire (definer privileges).
revoke execute on function public.handle_location_approval() from public, anon, authenticated;
revoke execute on function public.notify_location_milestone() from public, anon, authenticated;
revoke execute on function public.notify_city_live()          from public, anon, authenticated;

-- 3. Producer functions are invoked only by the cron routes via the
--    service-role key. Lock them to service_role.
revoke execute on function public.enqueue_weekly_digests() from public, anon, authenticated;
revoke execute on function public.enqueue_reengagement()   from public, anon, authenticated;
grant  execute on function public.enqueue_weekly_digests() to service_role;
grant  execute on function public.enqueue_reengagement()   to service_role;
