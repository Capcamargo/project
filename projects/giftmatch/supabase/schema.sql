-- GiftMatch: актуальная плоская SQL-схема для Supabase SQL Editor
-- Синхронизировано с живой базой проекта GiftMatch.
-- Основной проект: https://giftmatch-qqdu.onrender.com

create extension if not exists pgcrypto;

-- =========================================================
-- 1) Профили пользователей
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text unique,
  full_name text,
  plan text not null default 'free' check (plan in ('free', 'plus', 'team')),
  is_paid boolean not null default false,
  role text not null default 'user' check (role in ('user', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profile_select_self" on public.profiles;
create policy "profile_select_self"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

drop policy if exists "users can insert own profile" on public.profiles;
create policy "users can insert own profile"
  on public.profiles for insert to authenticated
  with check (id = (select auth.uid()));

drop policy if exists "users can update own profile" on public.profiles;
create policy "users can update own profile"
  on public.profiles for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

-- =========================================================
-- 2) Публичные пресеты GiftMatch
-- =========================================================
create table if not exists public.gift_presets (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  occasion text not null,
  budget_hint text,
  relation text,
  interests text,
  notes text,
  tags text[] not null default '{}',
  image_path text,
  starting_price integer,
  short_description text,
  badge_text text,
  filter_tags text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.gift_presets enable row level security;

drop policy if exists "public can read gift presets" on public.gift_presets;
create policy "public can read gift presets"
  on public.gift_presets for select to anon, authenticated
  using (true);

-- =========================================================
-- 3) Запросы на подбор подарка
-- =========================================================
create table if not exists public.gift_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  occasion text not null,
  budget text not null,
  relation text,
  interests text not null,
  notes text,
  source text not null default 'manual',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gift_requests_user_id_idx on public.gift_requests (user_id);
create index if not exists gift_requests_created_at_idx on public.gift_requests (created_at desc);

alter table public.gift_requests enable row level security;

drop policy if exists "users can view own gift requests" on public.gift_requests;
create policy "users can view own gift requests"
  on public.gift_requests for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "users can insert own gift requests" on public.gift_requests;
create policy "users can insert own gift requests"
  on public.gift_requests for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "users can update own gift requests" on public.gift_requests;
create policy "users can update own gift requests"
  on public.gift_requests for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "users can delete own gift requests" on public.gift_requests;
create policy "users can delete own gift requests"
  on public.gift_requests for delete to authenticated
  using (user_id = (select auth.uid()));

-- =========================================================
-- 4) Результаты рекомендаций
-- =========================================================
create table if not exists public.gift_recommendations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  request_id uuid references public.gift_requests (id) on delete cascade,
  title text not null,
  reason text,
  explanation text,
  price_hint text,
  category text,
  tone text,
  score integer check (score >= 0 and score <= 100),
  is_saved boolean not null default false,
  saved_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gift_recommendations_user_id_idx on public.gift_recommendations (user_id);
create index if not exists gift_recommendations_request_id_idx on public.gift_recommendations (request_id);
create index if not exists gift_recommendations_saved_idx on public.gift_recommendations (user_id, is_saved, saved_at desc);

alter table public.gift_recommendations enable row level security;

drop policy if exists "users can view own gift recommendations" on public.gift_recommendations;
create policy "users can view own gift recommendations"
  on public.gift_recommendations for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists "users can insert own gift recommendations" on public.gift_recommendations;
create policy "users can insert own gift recommendations"
  on public.gift_recommendations for insert to authenticated
  with check (user_id = (select auth.uid()));

drop policy if exists "users can update own gift recommendations" on public.gift_recommendations;
create policy "users can update own gift recommendations"
  on public.gift_recommendations for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists "users can delete own gift recommendations" on public.gift_recommendations;
create policy "users can delete own gift recommendations"
  on public.gift_recommendations for delete to authenticated
  using (user_id = (select auth.uid()));

-- =========================================================
-- 5) Admin helper для учебной админ-панели
-- =========================================================
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

drop policy if exists "admins can view all profiles" on public.profiles;
create policy "admins can view all profiles"
  on public.profiles for select to authenticated
  using (public.giftmatch_is_admin());

drop policy if exists "admins can view all gift requests" on public.gift_requests;
create policy "admins can view all gift requests"
  on public.gift_requests for select to authenticated
  using (public.giftmatch_is_admin());

drop policy if exists "admins can view all gift recommendations" on public.gift_recommendations;
create policy "admins can view all gift recommendations"
  on public.gift_recommendations for select to authenticated
  using (public.giftmatch_is_admin());

-- =========================================================
-- 6) updated_at helper
-- =========================================================
create or replace function public.giftmatch_touch_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

revoke execute on function public.giftmatch_touch_updated_at() from anon, authenticated;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.giftmatch_touch_updated_at();

drop trigger if exists gift_presets_touch_updated_at on public.gift_presets;
create trigger gift_presets_touch_updated_at
before update on public.gift_presets
for each row execute function public.giftmatch_touch_updated_at();

drop trigger if exists gift_requests_touch_updated_at on public.gift_requests;
create trigger gift_requests_touch_updated_at
before update on public.gift_requests
for each row execute function public.giftmatch_touch_updated_at();

drop trigger if exists gift_recommendations_touch_updated_at on public.gift_recommendations;
create trigger gift_recommendations_touch_updated_at
before update on public.gift_recommendations
for each row execute function public.giftmatch_touch_updated_at();
