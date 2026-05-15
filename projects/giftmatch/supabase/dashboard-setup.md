# Supabase Dashboard Setup for GiftMatch

Project: `bozxbfosvzlayylrhtix`

## 1. SQL Editor

In Supabase Dashboard open **SQL Editor** and run these files in order:

1. `schema.sql`
2. `seed.sql`

Recommended copy source inside repository:
- `projects/giftmatch/supabase/schema.sql`
- `projects/giftmatch/supabase/seed.sql`

## 2. Authentication

Open **Authentication** and configure Email auth for the MVP.

Recommended MVP setup:
- enable Email sign-in;
- allow email + password sign up;
- disable email confirmation only if you want a frictionless demo;
- keep email confirmation enabled if you want a more realistic production-like flow.

## 3. Database tables expected after setup

The dashboard should contain these tables in `public` schema:
- `profiles`
- `gift_requests`
- `gift_recommendations`
- `gift_presets`

## 4. RLS

RLS should remain enabled for:
- `profiles`
- `gift_requests`
- `gift_recommendations`
- `gift_presets`

Policies are already created by `schema.sql`.

## 5. API credentials

Open **Project Settings** → **API** and copy:
- Project URL
- anon public key

These values are needed to connect the frontend to the dashboard project.

## 6. Important current limitation

The current GiftMatch frontend still stores profile, request history and saved items in `localStorage`.

That means:
- setting up the dashboard prepares the backend;
- but the current frontend will not automatically start using Supabase until the client-side code is connected to Supabase Auth and database queries.

## 7. Next integration step after dashboard setup

After the dashboard is ready, the frontend needs to be refactored so that:
- registration uses Supabase Auth;
- profile data is stored in `profiles`;
- gift requests are written to `gift_requests`;
- generated or saved recommendations are written to `gift_recommendations`;
- presets are loaded from `gift_presets` instead of hardcoded data where appropriate.
