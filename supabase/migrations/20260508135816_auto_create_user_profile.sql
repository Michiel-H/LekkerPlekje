-- Automatically create a public.users profile when a new auth user signs up.
-- Uses security definer to bypass RLS.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.users (id, display_name, pronoun)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'display_name', 'Nieuw lid'),
    coalesce((new.raw_user_meta_data->>'pronoun')::pronoun, 'neutraal')
  );
  return new;
end;
$$ language plpgsql security definer;

-- Trigger on auth.users insert
create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
