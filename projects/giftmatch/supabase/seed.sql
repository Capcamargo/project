insert into public.gift_presets (slug, title, occasion, budget_label, relation_label, interests, notes)
values
  (
    'friend-birthday',
    'Другу на день рождения',
    'День рождения',
    'до 5000 ₽',
    'Друг',
    'настольные игры, кофе, путешествия',
    'Хочется, чтобы подарок был небанальным, полезным и визуально приятным.'
  ),
  (
    'partner-anniversary',
    'Партнеру на годовщину',
    'Годовщина отношений',
    'до 10000 ₽',
    'Партнер',
    'совместные впечатления, уют, эстетика',
    'Важно, чтобы подарок подчеркивал внимание и заботу.'
  ),
  (
    'parents-anniversary',
    'Родителям на юбилей',
    'Юбилей',
    'до 15000 ₽',
    'Родители',
    'дом, отдых, семейные вещи',
    'Нужен теплый, символичный и уместный подарок.'
  ),
  (
    'colleague-birthday',
    'Коллеге без долгого поиска',
    'День рождения коллеги',
    'до 3000 ₽',
    'Коллега',
    'офис, кофе, минималистичные вещи',
    'Нужен быстрый и безопасный выбор без лишнего риска.'
  )
on conflict (slug) do update set
  title = excluded.title,
  occasion = excluded.occasion,
  budget_label = excluded.budget_label,
  relation_label = excluded.relation_label,
  interests = excluded.interests,
  notes = excluded.notes;
