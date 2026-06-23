-- [SCHEDULING — no Vercel Pro] Run all notification scheduling inside Postgres
-- via pg_cron, so we don't need Vercel's sub-daily cron (Pro-only).
--   * producers (digest, re-engage) run as direct SQL — no HTTP.
--   * the dispatcher is the only job that needs the Node runtime (web-push),
--     so pg_cron calls the deployed /api/push/dispatch endpoint via pg_net.
--
-- Secrets live in Supabase Vault (names: cron_secret, app_url), NOT in this file.
-- Create them once with:
--   select vault.create_secret('<CRON_SECRET>', 'cron_secret');
--   select vault.create_secret('https://lekkerplekje.com', 'app_url');

create extension if not exists pg_cron;
create extension if not exists pg_net;

-- Fire the dispatcher endpoint. Reads the bearer secret + base URL from Vault.
create or replace function public.dispatch_push_notifications()
returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_secret text;
  v_url    text;
begin
  select decrypted_secret into v_secret from vault.decrypted_secrets where name = 'cron_secret';
  select decrypted_secret into v_url    from vault.decrypted_secrets where name = 'app_url';
  if v_secret is null or v_url is null then
    raise warning 'dispatch_push_notifications: missing vault secret (cron_secret/app_url)';
    return;
  end if;
  perform net.http_get(
    url := v_url || '/api/push/dispatch',
    headers := jsonb_build_object('Authorization', 'Bearer ' || v_secret)
  );
end;
$$;

revoke execute on function public.dispatch_push_notifications() from public, anon, authenticated;

-- (Re)schedule idempotently.
do $$
declare j text;
begin
  foreach j in array array['lp-dispatch', 'lp-weekly-digest', 'lp-reengage'] loop
    if exists (select 1 from cron.job where jobname = j) then
      perform cron.unschedule(j);
    end if;
  end loop;
end $$;

-- Dispatcher: every minute (it self-defers during NL quiet hours 22:00–08:00).
select cron.schedule('lp-dispatch', '* * * * *', $$select public.dispatch_push_notifications();$$);
-- Weekly digest: Thursday 17:00 UTC.
select cron.schedule('lp-weekly-digest', '0 17 * * 4', $$select public.enqueue_weekly_digests();$$);
-- Re-engagement: daily 16:00 UTC.
select cron.schedule('lp-reengage', '0 16 * * *', $$select public.enqueue_reengagement();$$);
