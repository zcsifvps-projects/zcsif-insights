# ZCSIF Engagement Tracker

A standalone web app for ZCSIF to track **Events**, **Trainings**, and **Feedback** — with an attendance register and a dashboard.

Full ownership: plain React + Vite frontend, Supabase (Postgres + Auth) backend. No page-builder platform, no export limits, no billing gate on your own code.

## Stack

- React 18 + Vite
- Tailwind CSS
- React Router
- Recharts (dashboard charts)
- Supabase (`@supabase/supabase-js`) — database, auth

## 1. Set up Supabase

1. Create a free project at [supabase.com](https://supabase.com).
2. In your project, go to **SQL Editor → New query**, paste the contents of `supabase/schema.sql`, and run it. This creates the `events`, `trainings`, `participants`, and `feedback` tables with row-level security enabled for signed-in users.
3. Go to **Project Settings → API** and copy your **Project URL** and **anon public key**.
4. In **Authentication → Providers**, make sure **Email** is enabled (it is by default). Optionally disable "Confirm email" while testing, under **Authentication → Settings**, so new accounts can sign in immediately.

## 2. Configure the app

```bash
cp .env.local.example .env.local
```

Edit `.env.local` and paste in your Supabase URL and anon key:

```
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-public-key
```

## 3. Install and run

```bash
npm install
npm run dev
```

Open the local URL Vite prints (usually `http://localhost:5173`). Sign up for an account on the login screen — the first account you create is a normal staff account; add more from the same screen or by inviting users in the Supabase dashboard under **Authentication → Users**.

## 4. Build for production

```bash
npm run build
```

Outputs a static `dist/` folder — deploy it anywhere that serves static files (Vercel, Netlify, Cloudflare Pages, etc.). Set the two `VITE_SUPABASE_*` environment variables in your hosting provider's dashboard the same way as `.env.local`.

## Project structure

```
src/
  api/supabaseClient.js      # Supabase client + data-access functions per table
  lib/AuthContext.jsx        # Auth state (Supabase Auth)
  lib/constants.js           # Dropdown option lists (event types, statuses, etc.)
  components/
    layout/Layout.jsx        # Sidebar + page shell
    events/                  # EventForm, EventsTable
    trainings/                # TrainingForm, TrainingsTable
    participants/             # ParticipantsPanel (attendance register)
    feedback/                  # FeedbackForm, FeedbackList, FeedbackPanel
    ui/                        # Button, Field, Card, Modal, Tabs, Toaster
  pages/
    Login.jsx
    Dashboard.jsx
    Events.jsx / EventDetail.jsx
    Trainings.jsx / TrainingDetail.jsx
    Feedback.jsx
supabase/schema.sql           # Full database schema — source of truth for tables
```

## What's built (v2)

- ✅ Auth (email/password via Supabase)
- ✅ Events: list with search/filter, create/edit, detail view, CSV export
- ✅ Trainings: list with search/filter, create/edit, detail view, CSV export
- ✅ Participants: attendance register embedded in Event/Training detail, CSV export/import (paste or file upload, duplicate-name detection on both single add and bulk import)
- ✅ Feedback: staff-entered, both as a master log and embedded per record, CSV export, unresolved-follow-up banner/filter
- ✅ Public no-login feedback form (`/give-feedback/:module/:id`), with a QR code (view + downloadable PNG) generated on each Event/Training detail page for easy printing/display at the venue
- ✅ Certificate generation: for trainings with "Certification provided" checked, a one-click PDF certificate can be generated per participant marked "Attended"
- ✅ Global search: sidebar search box across Events and Trainings by name/location, jumps straight to the record
- ✅ Attendance-rate badges (color-coded % of expected participants) on Events/Trainings tables
- ✅ Dashboard: activity per month, attendance vs. target, feedback rating trend, gender split, unresolved-feedback count and list, date-range filter, one-click PDF summary report export

## Deferred / next phases

- Roll-up of Events/Trainings under Projects, if ZCSIF adds a Projects module later
- Per-user ownership / role-based permissions (currently any signed-in staff account has full access)
