-- GiftMatch: базовые таблицы users/profiles + анкеты + результаты подбора + RLS
-- Выполнить в Supabase → SQL Editor

-- =========================================================
-- 1) Профили пользователей
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own"
  on public.profiles for select to authenticated
  using (id = auth.uid());

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own"
  on public.profiles for insert to authenticated
  with check (id = auth.uid());

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own"
  on public.profiles for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- =========================================================
-- 2) Анкеты подбора подарка
-- =========================================================
create table if not exists public.gift_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  occasion text not null,
  budget_min integer,
  budget_max integer,
  recipient_interests text not null,
  recipient_relation text,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists gift_requests_user_id_idx on public.gift_requests (user_id);

alter table public.gift_requests enable row level security;

drop policy if exists "gift_requests_select_own" on public.gift_requests;
create policy "gift_requests_select_own"
  on public.gift_requests for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "gift_requests_insert_own" on public.gift_requests;
create policy "gift_requests_insert_own"
  on public.gift_requests for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "gift_requests_update_own" on public.gift_requests;
create policy "gift_requests_update_own"
  on public.gift_requests for update to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

drop policy if exists "gift_requests_delete_own" on public.gift_requests;
create policy "gift_requests_delete_own"
  on public.gift_requests for delete to authenticated
  using (user_id = auth.uid());

-- =========================================================
-- 3) Результаты рекомендаций
-- =========================================================
create table if not exists public.gift_recommendations (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.gift_requests (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  title text not null,
  description text,
  category text,
  price_estimate integer,
  purchase_url text,
  created_at timestamptz not null default now()
);

create index if not exists gift_recommendations_request_id_idx on public.gift_recommendations (request_id);
create index if not exists gift_recommendations_user_id_idx on public.gift_recommendations (user_id);

alter table public.gift_recommendations enable row level security;

drop policy if exists "gift_recommendations_select_own" on public.gift_recommendations;
create policy "gift_recommendations_select_own"
  on public.gift_recommendations for select to authenticated
  using (user_id = auth.uid());

drop policy if exists "gift_recommendations_insert_own" on public.gift_recommendations;
create policy "gift_recommendations_insert_own"
  on public.gift_recommendations for insert to authenticated
  with check (user_id = auth.uid());

drop policy if exists "gift_recommendations_delete_own" on public.gift_recommendations;
create policy "gift_recommendations_delete_own"
  on public.gift_recommendations for delete to authenticated
  using (user_id = auth.uid());

-- =========================================================
-- 4) updated_at триггер для profiles
-- =========================================================
create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end; $$;

drop trigger if exists profiles_touch_updated_at on public.profiles;
create trigger profiles_touch_updated_at
before update on public.profiles
for each row execute function public.touch_updated_at();
