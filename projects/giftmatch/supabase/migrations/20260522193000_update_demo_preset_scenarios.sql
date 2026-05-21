-- GiftMatch: update demo gift preset scenarios so catalog cards do not all look like birthday use cases.

update public.gift_presets
set
  occasion = 'Подарок для уютного вечера',
  budget_hint = 'до 5000 ₽',
  relation = 'Друг',
  interests = 'настольные игры, кофе, спокойные вечера',
  notes = 'Нужен небанальный, полезный и уютный подарок для человека, который любит кофе и настольные игры.'
where slug in ('friend', 'coffee');

update public.gift_presets
set
  occasion = 'Совместный подарок-впечатление',
  budget_hint = 'до 10000 ₽',
  relation = 'Партнер',
  interests = 'совместные впечатления, творчество, уютные вечера',
  notes = 'Нужен подарок-впечатление для двоих, а не просто вещь. Важно, чтобы подарок подчеркивал внимание и заботу.'
where slug = 'romantic';

update public.gift_presets
set
  occasion = 'Памятный семейный подарок',
  budget_hint = 'до 15000 ₽',
  relation = 'Родители или близкие родственники',
  interests = 'семейные воспоминания, дом, памятные вещи',
  notes = 'Нужен теплый, личный и памятный подарок с семейной историей.'
where slug = 'parents';

update public.gift_presets
set
  occasion = 'Нейтральный подарок коллеге',
  budget_hint = 'до 3000 ₽',
  relation = 'Коллега',
  interests = 'офис, кофе, минималистичные вещи, рабочий день',
  notes = 'Нужен нейтральный, аккуратный и уместный подарок без лишнего риска.'
where slug = 'colleague';

update public.gift_presets
set
  occasion = 'Домашний уют',
  budget_hint = 'до 4000 ₽',
  relation = 'Друг или близкий человек',
  interests = 'уют, дом, ароматические свечи, ручная работа',
  notes = 'Нужен спокойный домашний подарок для человека, который любит атмосферные детали и уют.'
where slug = 'handmade';

update public.gift_presets
set
  occasion = 'Подарок для активного образа жизни',
  budget_hint = 'до 6000 ₽',
  relation = 'Друг или близкий человек',
  interests = 'спорт, тренировки, восстановление, активный образ жизни',
  notes = 'Нужен полезный подарок для человека, который занимается спортом и любит практичные вещи.'
where slug = 'sport';
