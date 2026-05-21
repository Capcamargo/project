-- GiftMatch: admin role support for the educational MVP.
-- This migration adds a minimal admin role and read-only admin dashboard access.

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

drop policy if exists "admins can view all profiles" on public.profiles;
create policy "admins can view all profiles"
on public.profiles
for select
to authenticated
using (public.giftmatch_is_admin());

drop policy if exists "admins can view all gift requests" on public.gift_requests;
create policy "admins can view all gift requests"
on public.gift_requests
for select
to authenticated
using (public.giftmatch_is_admin());

drop policy if exists "admins can view all gift recommendations" on public.gift_recommendations;
create policy "admins can view all gift recommendations"
on public.gift_recommendations
for select
to authenticated
using (public.giftmatch_is_admin());
