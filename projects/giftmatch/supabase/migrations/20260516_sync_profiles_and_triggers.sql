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

-- Extended preset seed mirrored from production Supabase state.
insert into public.gift_presets (
  slug,
  title,
  occasion,
  budget_hint,
  relation,
  interests,
  notes,
  tags,
  starting_price,
  short_description,
  badge_text,
  filter_tags
)
values
  ('gamer', 'Подарочный набор для геймера', 'день рождения', '4000-9000 ₽', 'друг', 'игры, техника, онлайн-развлечения', 'Хороший вариант для человека, который проводит много времени за играми и ценит практичные аксессуары.', array['Гейминг', 'Техника', 'Практичный подарок'], 5900, 'Уместный вариант для друга или партнера, который любит игры и полезные аксессуары.', '🎮 Для тех, кто играет часто', array['birthday','gamer','tech']),
  ('booklover', 'Коллекционное издание книги', 'день рождения', '2500-7000 ₽', 'друг', 'книги, чтение, искусство', 'Подойдет человеку, который любит красивые издания, бумагу, иллюстрации и личные подарки со смыслом.', array['Книги', 'Эстетика', 'Интеллектуальный подарок'], 3600, 'Подарок для тех, кому важно не только содержание, но и само издание.', '📚 Для внимательного читателя', array['birthday','books','aesthetic']),
  ('coffee', 'Набор для альтернативного кофе', 'день рождения', '3000-8000 ₽', 'друг', 'кофе, уют, кухня', 'Хорошо ложится в сценарий, где человек любит кофе, утренние ритуалы и красивые вещи для дома.', array['Кофе', 'Дом', 'Уют'], 4700, 'Практичный и атмосферный подарок для любителя кофе и домашних ритуалов.', '☕ Для кофейного ритуала', array['coffee','home','cozy']),
  ('beauty', 'Бьюти-бокс с уходом', '8 марта', '3500-9000 ₽', 'партнер', 'уход, косметика, комфорт', 'Подойдет, если хочется собрать аккуратный и визуально приятный подарок с ощущением заботы.', array['Уход', 'Комфорт', 'Персональный подарок'], 5200, 'Вариант для человека, которому важны качество, уход и приятные детали.', '✨ Забота в красивой упаковке', array['beauty','care','holiday']),
  ('wellness', 'Набор для отдыха и восстановления', 'универсальный повод', '3000-8500 ₽', 'близкий человек', 'релакс, спорт, восстановление', 'Уместно, если хочется выбрать подарок про комфорт, расслабление и ощущение заботы без излишней формальности.', array['Релакс', 'Здоровье', 'Дом'], 4300, 'Спокойный и универсальный подарок для восстановления и отдыха.', '🧖 Для спокойного вечера', array['relax','wellness','calm']),
  ('travel', 'Органайзер для путешествий', 'день рождения', '2500-6500 ₽', 'друг', 'путешествия, поездки, порядок', 'Хороший выбор для человека, который часто ездит и ценит удобство в дороге.', array['Путешествия', 'Организация', 'Практичный подарок'], 3400, 'Функциональный подарок для частых поездок и коротких путешествий.', '✈️ Для тех, кто в пути', array['travel','practical','birthday']),
  ('home-decor', 'Декор для дома и атмосферы', 'новоселье', '3000-10000 ₽', 'семья', 'дом, интерьер, уют', 'Подойдет на новоселье или в ситуации, когда хочется выбрать подарок, который делает пространство теплее.', array['Интерьер', 'Дом', 'Уют'], 5600, 'Подарок для дома, который выглядит аккуратно и ощущается уместно.', '🏠 Для нового пространства', array['home','decor','housewarming']),
  ('pet-owner', 'Подарок для владельца питомца', 'день рождения', '2000-7000 ₽', 'друг', 'животные, собаки, кошки', 'Хорошо работает, если важная часть жизни человека — питомец, а подарок хочется сделать личным и веселым.', array['Питомцы', 'Личное', 'Забота'], 3200, 'Небольшой, но очень персональный подарок для владельца питомца.', '🐾 Для любителей животных', array['pets','birthday','personal']),
  ('creative', 'Набор для творчества', 'день рождения', '3500-9500 ₽', 'друг', 'рисование, творчество, хобби', 'Подойдет человеку, который любит делать что-то руками и ценит материалы, к которым хочется возвращаться.', array['Творчество', 'Хобби', 'Вдохновение'], 6100, 'Подарок с потенциалом на долгое использование и личное удовольствие.', '🎨 Для вдохновения и практики', array['creative','hobby','birthday']),
  ('teen', 'Подростковый трендовый набор', 'день рождения', '2500-8000 ₽', 'родственник', 'тренды, стиль, гаджеты', 'Уместный вариант для подростка, когда нужен современный, понятный и визуально привлекательный подарок.', array['Подростки', 'Тренды', 'Стиль'], 3900, 'Сценарий для подарка, который ощущается актуальным и не слишком формальным.', '🧩 Актуально и современно', array['teen','trend','birthday']),
  ('office-premium', 'Премиум-набор для рабочего стола', 'профессиональный праздник', '5000-12000 ₽', 'коллега', 'работа, офис, статус', 'Подойдет в деловом контексте, если нужен аккуратный, статусный и действительно используемый подарок.', array['Офис', 'Статус', 'Практичный подарок'], 7900, 'Более премиальный вариант для коллеги, руководителя или делового партнера.', '💼 Для делового впечатления', array['office','premium','work']),
  ('family-experience', 'Семейный сертификат-впечатление', 'годовщина', '6000-15000 ₽', 'семья', 'впечатления, совместное время, отдых', 'Подойдет, когда хочется подарить не предмет, а совместное время, воспоминание и повод провести день вместе.', array['Впечатления', 'Семья', 'Совместный досуг'], 8900, 'Подарок с эмоциональной ценностью и ощущением общего события.', '🎟 Вместо вещи — впечатление', array['family','experience','anniversary'])
on conflict (slug) do update
set title = excluded.title,
    occasion = excluded.occasion,
    budget_hint = excluded.budget_hint,
    relation = excluded.relation,
    interests = excluded.interests,
    notes = excluded.notes,
    tags = excluded.tags,
    starting_price = excluded.starting_price,
    short_description = excluded.short_description,
    badge_text = excluded.badge_text,
    filter_tags = excluded.filter_tags,
    updated_at = now();

-- The current project keeps the existing RLS policies for gift_requests and
-- gift_recommendations. The profiles SELECT policy is recreated separately in
-- production as profile_select_self.
