create or replace function public.set_row_updated_at()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name')
  )
  on conflict (id) do update
    set email = excluded.email,
        full_name = coalesce(excluded.full_name, public.profiles.full_name),
        updated_at = now();

  return new;
end;
$$;

create or replace function public.handle_updated_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.profiles
     set email = new.email,
         full_name = coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name', public.profiles.full_name),
         updated_at = now()
   where id = new.id;

  return new;
end;
$$;

insert into public.profiles (id, email, full_name)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'full_name', u.raw_user_meta_data ->> 'name')
from auth.users u
on conflict (id) do update
  set email = excluded.email,
      full_name = coalesce(excluded.full_name, public.profiles.full_name),
      updated_at = now();

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

drop trigger if exists on_auth_user_updated on auth.users;
create trigger on_auth_user_updated
  after update of email, raw_user_meta_data on auth.users
  for each row execute procedure public.handle_updated_user();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_row_updated_at();

drop trigger if exists set_gift_presets_updated_at on public.gift_presets;
create trigger set_gift_presets_updated_at
  before update on public.gift_presets
  for each row execute procedure public.set_row_updated_at();

drop trigger if exists set_gift_requests_updated_at on public.gift_requests;
create trigger set_gift_requests_updated_at
  before update on public.gift_requests
  for each row execute procedure public.set_row_updated_at();

drop trigger if exists set_gift_recommendations_updated_at on public.gift_recommendations;
create trigger set_gift_recommendations_updated_at
  before update on public.gift_recommendations
  for each row execute procedure public.set_row_updated_at();

-- The current project keeps the existing RLS policies for gift_requests and
-- gift_recommendations. The profiles SELECT policy is recreated separately in
-- production as profile_select_self.
