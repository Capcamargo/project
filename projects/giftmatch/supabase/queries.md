# Supabase queries plan

Ниже описаны ключевые запросы GiftMatch для проверки живой базы, отладки MVP и демонстрации на экзамене.

## 1. Получить профиль текущего пользователя

Используется в кабинете, на странице тарифов и после тестовой оплаты.

```sql
select id, email, full_name, plan, is_paid, role, avatar_url, created_at, updated_at
from public.profiles
where id = auth.uid();
```

Ожидаемый результат: пользователь видит только собственный профиль благодаря RLS.

## 2. Получить публичные пресеты каталога

Используется на главной странице для карточек готовых идей.

```sql
select
  id,
  slug,
  title,
  occasion,
  budget_hint,
  relation,
  interests,
  notes,
  tags,
  image_path,
  starting_price,
  short_description,
  badge_text,
  filter_tags
from public.gift_presets
order by created_at asc;
```

Ожидаемый результат: пресеты доступны гостям и авторизованным пользователям только на чтение.

## 3. Создать запрос на подбор подарка

Создается после отправки формы подбора.

```sql
insert into public.gift_requests (
  user_id,
  occasion,
  budget,
  relation,
  interests,
  notes,
  source
)
values (
  auth.uid(),
  'День рождения',
  'до 5000 ₽',
  'Друг',
  'настольные игры, кофе, путешествия',
  'Нужен небанальный и полезный подарок',
  'web_app'
)
returning id, occasion, budget, relation, interests, notes, source, created_at;
```

Ожидаемый результат: запись создается только с `user_id = auth.uid()`.

## 4. Сохранить результаты рекомендаций

Создается после подбора. В приложении это делает Edge Function `giftmatch-recommendations`.

```sql
insert into public.gift_recommendations (
  user_id,
  request_id,
  title,
  reason,
  explanation,
  price_hint,
  category,
  tone,
  score,
  is_saved,
  saved_at
)
values (
  auth.uid(),
  '<request_id>',
  'Кофе и настольная игра',
  'Подходит под интересы получателя',
  'Уместный подарок для спокойного вечера',
  'от 3900 ₽',
  'Для уютного вечера',
  'Практично и тепло',
  92,
  false,
  null
);
```

## 5. Получить историю запросов пользователя

```sql
select id, occasion, budget, relation, interests, notes, source, created_at
from public.gift_requests
where user_id = auth.uid()
order by created_at desc;
```

## 6. Получить сохраненные рекомендации пользователя

```sql
select
  gr.id,
  gr.title,
  gr.reason,
  gr.explanation,
  gr.price_hint,
  gr.category,
  gr.tone,
  gr.score,
  gr.saved_at,
  json_build_object(
    'id', req.id,
    'occasion', req.occasion,
    'budget', req.budget,
    'relation', req.relation,
    'interests', req.interests,
    'notes', req.notes
  ) as request
from public.gift_recommendations gr
left join public.gift_requests req on req.id = gr.request_id
where gr.user_id = auth.uid()
  and gr.is_saved = true
order by gr.saved_at desc nulls last, gr.created_at desc;
```

## 7. Проверить лимит Free-плана

```sql
select count(*) as saved_count
from public.gift_recommendations
where user_id = auth.uid()
  and is_saved = true;
```

Логика MVP: на бесплатном плане пользователь может сохранить две подборки. При попытке сохранить третью открывается paywall.

## 8. Обновить тариф после тестового платежного сценария

```sql
update public.profiles
set
  plan = 'plus',
  is_paid = true,
  updated_at = now()
where id = auth.uid()
returning id, email, full_name, plan, is_paid, updated_at;
```

Важно: в текущем MVP это учебная имитация платежа. Реальная платежная интеграция с ЮKassa или CloudPayments не подключена.

## 9. Назначить администратора вручную

Этот запрос выполняется только владельцем проекта в Supabase SQL Editor. Он нужен для демонстрации `admin.html`.

```sql
update public.profiles
set role = 'admin'
where email = 'admin@example.com'
returning id, email, full_name, role;
```

Для обычных пользователей значение роли остается `user`.

## 10. Проверить, является ли текущий пользователь администратором

```sql
select public.giftmatch_is_admin() as is_admin;
```

## 11. Admin dashboard: агрегированные показатели

Эти запросы используются на `admin.html` для учебной админ-панели.

```sql
select count(*) as users_count from public.profiles;
select count(*) as requests_count from public.gift_requests;
select count(*) as recommendations_count from public.gift_recommendations;
select count(*) as saved_count from public.gift_recommendations where is_saved = true;
```

Ожидаемый результат: обычный пользователь не получает общую статистику, администратор получает ее через admin read policies.

## 12. Admin dashboard: список пресетов

```sql
select title, occasion, starting_price
from public.gift_presets
order by created_at asc
limit 12;
```

## 13. Проверить RLS вручную

Для авторизованного пользователя запросы к `profiles`, `gift_requests` и `gift_recommendations` должны возвращать только его собственные данные. Для гостя приватные таблицы не должны отдавать пользовательские записи. Для пользователя с `role = 'admin'` доступна учебная сводка в `admin.html`.

## Что проверить перед демонстрацией

- профиль создается после регистрации;
- публичные пресеты читаются на главной странице;
- форма создает `gift_requests`;
- рекомендации создаются в `gift_recommendations`;
- сохраненные рекомендации появляются в кабинете;
- free-лимит открывает paywall;
- тестовая активация обновляет `profiles.plan`;
- admin-роль открывает `admin.html`;
- обычный пользователь не видит admin-dashboard;
- чужие данные недоступны через клиентские запросы.
