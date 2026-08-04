# Lumio literacy MVP

Lumio is a dependency-free progressive web app (PWA) designed as the first literacy module of a wider child-learning platform.

## Publish

Upload the contents of this folder to Netlify Drop. The site works without a build step and is installable from modern mobile browsers. To publish to Google Play later, wrap this PWA with Trusted Web Activity (Bubblewrap) or migrate the presentation layer to Flutter while retaining the language packages and curriculum data.

## Architecture

- `data/languages.js` — language catalog and complete language packages. Application logic reads alphabet, phonics, writing rules, UI text, and curriculum from the selected package.
- `modules/storage.js` — local/offline profile, rewards, settings, and progress adapter. It is intentionally isolated so Firebase or Supabase synchronisation can be added without changing learning screens.
- `app.js` — reusable literacy lesson runner, parent view, reward flow, and navigation.
- `service-worker.js` + `manifest.webmanifest` — offline PWA foundation.

## Adding a language

Create a language package in `data/languages.js` (or split it into its own file) with metadata, locale, alphabet, phonics, writing rules, translated UI strings, and curriculum words. No learning game logic needs to change.

## Cost-aware roadmap

Use Firebase Spark or Supabase free tier only when cross-device accounts are enabled. Google Mobile Ads can occupy the existing bottom banner slot later; keep it disabled for child-directed releases until the compliance configuration is complete.
