-- [LOW] The avatars bucket was previously created in the dashboard and
-- not tracked in migrations. Pin it down here.

insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

drop policy if exists "Avatars public read" on storage.objects;
-- Pre-existing dashboard-created policy with a different name:
drop policy if exists "Avatar images are publicly readable" on storage.objects;
drop policy if exists "Users can upload own avatar" on storage.objects;
drop policy if exists "Users can update own avatar" on storage.objects;
drop policy if exists "Users can delete own avatar" on storage.objects;

create policy "Avatars public read"
  on storage.objects for select
  to public
  using (bucket_id = 'avatars');

-- Filenames are stored as `<user_id>/<timestamp>.<ext>`; the first segment
-- must match the uploader's auth.uid().
create policy "Users can upload own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'avatars'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

-- Tighten the locations bucket too: uploaders can only write to their own folder.
drop policy if exists "Authenticated Users can upload" on storage.objects;
drop policy if exists "Users can upload own location photo" on storage.objects;
drop policy if exists "Users can update own location photo" on storage.objects;
drop policy if exists "Users can delete own location photo" on storage.objects;

create policy "Users can upload own location photo"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'locations'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can update own location photo"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'locations'
    and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy "Users can delete own location photo"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'locations'
    and (storage.foldername(name))[1] = auth.uid()::text
  );
