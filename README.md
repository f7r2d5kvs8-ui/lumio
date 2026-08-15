# Lumio literacy MVP

Lumio is a dependency-free progressive web app (PWA) designed as the first literacy module of a wider child-learning platform.

## Publish

GitHub repository `f7r2d5kvs8-ui/lumio` is the source of truth. Publish changes through a branch and pull request, then merge them into `main`. The site works without a build step and is installable from modern mobile browsers. To publish to Google Play later, wrap this PWA with Trusted Web Activity (Bubblewrap) or migrate the presentation layer to Flutter while retaining the language packages and curriculum data.

## Architecture

- `data/languages.js` — language catalog and complete language packages. Application logic reads alphabet, phonics, writing rules, UI text, and curriculum from the selected package.
- `modules/storage.js` — local/offline profile, rewards, settings, and progress adapter. It is intentionally isolated so Firebase or Supabase synchronisation can be added without changing learning screens.
- `modules/analytics.js` — failure-isolated, privacy-minimized event submission shared conceptually with a future Android client.
- `app.js` — reusable literacy lesson runner, parent view, reward flow, and navigation.
- `service-worker.js` + `manifest.webmanifest` — offline PWA foundation.

## Private analytics dashboard

The analytics migrations are already applied to the existing Supabase project. For another environment, apply the files in `supabase/migrations`, then mark one existing adult account as an administrator from the Supabase SQL Editor (replace the UUID, never put this operation in browser code):

```sql
update auth.users
set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || '{"lumio_admin": true}'::jsonb
where id = '<admin-user-uuid>'::uuid;
```

Sign that account out and back in so its JWT refreshes. Authorized administrators then see an **Admin** view link in the app header, and `/admin.html` includes a **User view** link back to the child application. Ordinary users never see the admin entry and cannot load its analytics data. The dashboard receives aggregate data only. Remove access by deleting the `lumio_admin` key in `raw_app_meta_data`, then revoke the account's active sessions if access must end immediately.

The migration grants event `INSERT` only to guests and signed-in users. It grants no raw-event `SELECT`; the aggregate RPC verifies `app_metadata.lumio_admin` server-side before reading through RLS. The browser uses only the existing Supabase publishable key.

### Android event contract

A future Android client can insert into the same `analytics_events` table with `platform: "android"`, its app version, a random installation UUID, a per-session UUID, the Supabase `user_id` when signed in, and the same event/activity names used by `modules/analytics.js`. It should omit `user_id` for guests and use the normal publishable key so the same RLS policies apply. Do not send Android Advertising ID, hardware identifiers, names, entered text, exact age, or location. Keep submissions asynchronous and non-blocking, as on web.

## Adding a language

Create a language package in `data/languages.js` (or split it into its own file) with metadata, locale, alphabet, phonics, writing rules, translated UI strings, and curriculum words. No learning game logic needs to change.

## Privacy and child safety

Lumio is ad-free and uses adult-managed subscriptions for future paid features. Account creation and parent settings sit behind an adult gate. Analytics deliberately excludes names, entered text, birth dates, location, advertising identifiers, and per-tap tracking. Keep `privacy.html`, `account-deletion.html`, and `GOOGLE_PLAY_DATA_SAFETY.md` accurate whenever data handling changes.

Before publishing, deploy the authenticated `delete-account` Supabase Edge Function in `supabase/functions/delete-account`, verify deletion in production, and complete the Google Play declarations described in `PUBLISHING_CHECKLIST.md`.
