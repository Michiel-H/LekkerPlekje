-- [SECURITY HARDENING] Tighten our SECURITY DEFINER functions.
--
-- The Supabase database linter flagged three issues:
--   1. Functions had `search_path` unset, which makes them vulnerable to
--      schema-injection via temp objects in a user's session.
--   2. `get_user_role()` and `handle_*` triggers were callable as RPC by
--      anon / authenticated users — they're meant to run from triggers
--      and from inside RLS USING() clauses only, not as REST endpoints.
--
-- Trigger-only functions still need EXECUTE for the postgres role (which
-- is what runs the trigger). We just revoke it from PUBLIC / anon /
-- authenticated so it isn't exposed over PostgREST.

-- 1. Pin search_path on every SECURITY DEFINER function we control.
alter function public.get_user_role() set search_path = public, pg_temp;
alter function public.handle_new_user() set search_path = public, pg_temp;
alter function public.handle_location_approval() set search_path = public, pg_temp;
alter function public.handle_toppertje_submission() set search_path = public, pg_temp;
alter function public.handle_vote_change() set search_path = public, pg_temp;
alter function public.refresh_location_tag_aggregates(uuid) set search_path = public, pg_temp;
alter function public.rate_limit_submissions() set search_path = public, pg_temp;
alter function public.rate_limit_votes() set search_path = public, pg_temp;

-- 2. Take away the default PUBLIC EXECUTE grant from trigger-only functions.
revoke execute on function public.handle_new_user() from public, anon, authenticated;
revoke execute on function public.handle_location_approval() from public, anon, authenticated;
revoke execute on function public.handle_toppertje_submission() from public, anon, authenticated;
revoke execute on function public.handle_vote_change() from public, anon, authenticated;
revoke execute on function public.refresh_location_tag_aggregates(uuid) from public, anon, authenticated;
revoke execute on function public.rate_limit_submissions() from public, anon, authenticated;
revoke execute on function public.rate_limit_votes() from public, anon, authenticated;

-- 3. `get_user_role()` IS meant to be callable from RLS, but only by the
-- 'authenticated' role inside an RLS USING() — that path uses the
-- function-owner's privileges, not the caller's EXECUTE grant, so we can
-- safely revoke from PUBLIC/anon without breaking RLS.
revoke execute on function public.get_user_role() from public, anon;

-- 4. Plug the "public bucket allows listing" advisor: replace the broad
-- bucket-wide SELECT policies with object-level ones. Public URLs still
-- work (those don't go through RLS), but anon clients can no longer
-- enumerate files via the storage list API.
drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Avatar images are publicly readable" on storage.objects;
drop policy if exists "Avatars public read" on storage.objects;

-- (The "Public can read own bucket objects via signed URL" pattern doesn't
-- need an RLS SELECT policy at all — the public URL endpoint bypasses RLS
-- for buckets marked public=true. Listing IS gated by RLS, so removing
-- the SELECT policy is the fix.)
