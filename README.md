# GiftMatch — Сервис персонализированного подбора подарков

Курсовой MVP-проект по дисциплине **«Программирование без кода»**.

## Идея

GiftMatch помогает быстро подобрать подходящий подарок по интересам получателя, поводу и бюджету. Вместо хаотичного поиска по маркетплейсам пользователь отвечает на несколько простых вопросов и получает персонализированную подборку вариантов.

## Домашние задания

| # | Тема | Документ | Промпт | Статус |
|---|------|----------|--------|--------|
| 1 | Проблема, ЦА, ценность MVP | [hw1-problem-audience-value.md](notes/hw1-problem-audience-value.md) | [01-idea-generation.md](prompts/01-idea-generation.md) | done |
| 2 | Пользователь, функции, user flow | [hw2-user-functions-userflow.md](notes/hw2-user-functions-userflow.md) | [02-mvp-scope.md](prompts/02-mvp-scope.md) | done |
| 3 | Лендинг и интерактивный сценарий | [hw3-landing-interactive.md](notes/hw3-landing-interactive.md) | [03-landing-generation.md](prompts/03-landing-generation.md) | done |
| 4 | Улучшения MVP и архитектура | [hw4-improvements-architecture.md](notes/hw4-improvements-architecture.md) | [04-mvp-improvements.md](prompts/04-mvp-improvements.md) | done |
| 4.2 | Декомпозиция MVP | [hw4_2-mvp-decomposition-table.md](notes/hw4_2-mvp-decomposition-table.md) | — | done |
| 5 | Улучшения через Cursor | [hw5-cursor-improvements.md](notes/hw5-cursor-improvements.md) | [05-cursor-improvements.md](prompts/05-cursor-improvements.md) | done |
| 6 | Подключение БД и авторизация | [hw6-database-auth.md](notes/hw6-database-auth.md) | [06-database-auth.md](prompts/06-database-auth.md) | done |
| 7 | Auth flow | [hw7-auth-flow.md](notes/hw7-auth-flow.md) | [07-auth-flow.md](prompts/07-auth-flow.md) | done |
| 8 | Публикация / деплой | [hw8-deploy.md](notes/hw8-deploy.md) | [08-deploy.md](prompts/08-deploy.md) | done |
| 9 | Аналитика | [hw9-analytics.md](notes/hw9-analytics.md) | [09-analytics.md](prompts/09-analytics.md) | done |
| 10 | Paywall и монетизация | [hw10-paywall.md](notes/hw10-paywall.md) | [10-paywall.md](prompts/10-paywall.md) | done |
| 11 | Безопасность MVP | [hw11-security.md](notes/hw11-security.md) | notes only | done |

## Что решает продукт

- сложно придумать оригинальный и уместный подарок;
- поиск по разным сайтам занимает слишком много времени;
- пользователь боится выбрать банальный или неподходящий вариант;
- при ограниченном бюджете особенно трудно быстро принять решение.

## Целевая аудитория MVP

Первый MVP ориентирован на занятых пользователей 18–35 лет, которым нужно быстро выбрать подарок другу, партнеру, родственнику или коллеге.

## Ценность MVP

Пользователь получает персонализированную подборку подарков за несколько минут. Это снижает стресс, экономит время и помогает прийти к более уверенному решению.

## Основной JTBD

Когда мне нужно выбрать подарок близкому человеку и я не уверен, что ему подойдет, я хочу за несколько минут получить уместные идеи с учетом интересов, повода и бюджета, чтобы быстро выбрать хороший подарок без стресса и долгого поиска.

## Что уже подготовлено в репозитории

- оформленные документы по домашним заданиям;
- отдельные промпты под ключевые этапы курса;
- проектная структура `notes / prompts / projects / assets / docs`;
- папка `projects/giftmatch/supabase/` с SQL-схемой, примерами и README;
- проектный бриф, scope MVP и материалы по валидации идеи;
- документы `mobile-mvp-plan.md`, `user-flow.md`, `screens.md`, `components-map.md`, `release-plan.md` внутри проекта;
- документы по модели данных, стеку, интервью и опросу.

## Стек

- **Frontend / mobile:** TypeScript + React Native + Expo
- **Backend / data:** Supabase
- **AI-tools:** ChatGPT, Cursor, GigaChat

## Почему выбран этот стек

TypeScript + React Native + Expo дают один стек и одну кодовую базу для дальнейшего развития под iOS и Android. Supabase позволяет быстро получить базу данных, Auth и API, не тратя время на сборку собственного backend с нуля.

## Структура репозитория

```text
├── prompts/
├── projects/
│   └── giftmatch/
│       ├── README.md
│       ├── mobile-mvp-plan.md
│       ├── user-flow.md
│       ├── screens.md
│       ├── components-map.md
│       ├── release-plan.md
│       └── supabase/
│           ├── README.md
│           ├── schema.sql
│           ├── queries.md
│           ├── rls-notes.md
│           └── sample-data.sql
├── assets/
├── notes/
└── docs/
```
