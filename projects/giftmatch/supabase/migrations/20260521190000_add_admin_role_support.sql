-- GiftMatch: admin role support for the educational MVP.
-- This migration adds a minimal admin role and read-only admin dashboard access.
-- SELECT policies are merged to avoid multiple permissive policies for the same role/action.

alter table public.profiles
add column if not exists role text not null default 'user' check (role in ('user', 'admin'));

create or replace function public.giftmatch_is_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1
    from public.profiles
    where id = auth.uid()
      and role = 'admin'
  );
$$;

revoke execute on function public.giftmatch_is_admin() from anon;
grant execute on function public.giftmatch_is_admin() to authenticated;

create or replace function public.giftmatch_prevent_role_self_change()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if old.role is distinct from new.role and current_user = 'authenticated' then
    raise exception 'Role changes are restricted';
  end if;
  return new;
end;
$$;

revoke execute on function public.giftmatch_prevent_role_self_change() from anon, authenticated;

drop trigger if exists profiles_prevent_role_self_change on public.profiles;
create trigger profiles_prevent_role_self_change
before update on public.profiles
for each row execute function public.giftmatch_prevent_role_self_change();

-- profiles SELECT: owner or admin

drop policy if exists "profile_select_self" on public.profiles;
drop policy if exists "admins can view all profiles" on public.profiles;
drop policy if exists "profiles_select_self_or_admin" on public.profiles;
create policy "profiles_select_self_or_admin"
on public.profiles
for select
to authenticated
using (
  id = (select auth.uid())
  or public.giftmatch_is_admin()
);

-- gift_requests SELECT: owner or admin

drop policy if exists "users can view own gift requests" on public.gift_requests;
drop policy if exists "admins can view all gift requests" on public.gift_requests;
drop policy if exists "gift_requests_select_self_or_admin" on public.gift_requests;
create policy "gift_requests_select_self_or_admin"
on public.gift_requests
for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.giftmatch_is_admin()
);

-- gift_recommendations SELECT: owner or admin

drop policy if exists "users can view own gift recommendations" on public.gift_recommendations;
drop policy if exists "admins can view all gift recommendations" on public.gift_recommendations;
drop policy if exists "gift_recommendations_select_self_or_admin" on public.gift_recommendations;
create policy "gift_recommendations_select_self_or_admin"
on public.gift_recommendations
for select
to authenticated
using (
  user_id = (select auth.uid())
  or public.giftmatch_is_admin()
);
