insert into storage.buckets (id, name, public) values ('locations', 'locations', true) on conflict (id) do nothing;

create policy "Public Access"
on storage.objects for select
to public
using ( bucket_id = 'locations' );

create policy "Authenticated Users can upload"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'locations' );
