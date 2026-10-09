# kcalBud: Simple Calorie Tracker

MVP mobile app for tracking protein, fiber, calories, carbs, and fat. Built with Expo (React Native) and Supabase.

## Stack

- **App:** Expo SDK 57, Expo Router, TypeScript
- **Backend:** Supabase (PostgreSQL, Auth, RLS)
- **State:** TanStack React Query + Zustand

## Project layout

```
app/          Expo Router screens
src/          Components, features, lib, hooks, stores, types
supabase/     Migrations and Edge Functions (backend-as-code)
```

## Setup

1. Copy environment variables:

   ```bash
   cp .env.example .env
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the dev server (phone via Expo Go):

   ```bash
   npm start
   ```

## EAS builds (Android / iOS APK)

Local `.env` is **not** uploaded to EAS. Cloud builds need the same `EXPO_PUBLIC_*` variables configured on Expo; without them the app crashes right after the green splash (`supabase.ts` throws on startup).

1. Log in: `npx eas-cli@latest login`
2. Create variables for the **preview** environment (repeat for **production** if you use that profile):

   ```bash
   npx eas-cli@latest env:create --scope project --environment preview \
     --name EXPO_PUBLIC_SUPABASE_URL --value "https://YOUR_PROJECT.supabase.co" --visibility plaintext

   npx eas-cli@latest env:create --scope project --environment preview \
     --name EXPO_PUBLIC_SUPABASE_ANON_KEY --value "YOUR_ANON_KEY" --visibility plaintext
   ```

   Or add them in [expo.dev](https://expo.dev) → your project → **Environment variables** (preview).

3. Build an installable APK (no Metro required on your phone):

   ```bash
   npx eas-cli@latest build --profile preview --platform android
   ```

4. After installing, add the **Redirect URI** shown on the login screen to Supabase Auth → URL Configuration.

## Supabase (Module 2)

### 1. Create a project

Create a project at [supabase.com](https://supabase.com). Copy the **Project URL** and **anon public key** into `.env`.

### 2. Apply the migration

**Option A — SQL Editor (simplest):**

1. Open **SQL Editor** in the Supabase dashboard
2. Paste the contents of `supabase/migrations/20260303120000_initial_schema.sql`
3. Click **Run**

**Option B — Supabase CLI:**

```bash
npx supabase login
npx supabase link --project-ref YOUR_PROJECT_REF
npx supabase db push
```

### 3. Verify tables

In **Table Editor**, confirm these tables exist:

- `profiles` — current user targets and body metrics
- `daily_logs` — daily consumed totals + snapshotted targets
- `food_entries` — individual food items

RLS should be enabled on all three tables.

### 4. Regenerate types (optional, after linking)

```bash
npx supabase gen types typescript --linked > src/types/database.ts
```

### Schema notes

- **`profiles`** holds current targets; **`daily_logs`** snapshots targets per day for accurate history
- **`get_or_create_daily_log(date)`** RPC creates a day row and copies targets from the profile
- Food entry triggers recompute `daily_logs` totals automatically
- `weight_logs` deferred to a future migration

## Google OAuth setup (Module 4)

1. **Google Cloud Console** → create OAuth client (Web application)
   - Authorized redirect URI: your Supabase callback, e.g. `https://<project-ref>.supabase.co/auth/v1/callback`
2. **Supabase** → Authentication → Providers → Google → paste Client ID + Secret
3. **Supabase** → Authentication → URL Configuration → add redirect URLs:
   - `calorie-tracker://auth/callback`
   - Your Expo Go dev URI shown on the login screen (if different during local testing)
4. Restart Expo after changing `.env`
