# Lumio

Lumio is a child-friendly literacy platform. The current release focuses on Dutch reading and word building, while the architecture is prepared for future languages and subjects.

## Live services

- Source and releases: https://github.com/f7r2d5kvs8-ui/lumio
- Authentication and progress: Supabase project `qmtzmlpgsvtietkqgwnb`
- Deployment: publish from GitHub; `main` is the production source branch

## Source layout

- `index.template.html` — hosted modular app shell
- `app.js` — screens, learning flow, and interactions
- `styles.css` — visual design and responsive layout
- `data/languages.js` — language package and Dutch curriculum
- `modules/storage.js` — local profile and offline progress
- `modules/cloud.js` — Supabase sign-in and cloud progress
- `modules/analytics.js` — asynchronous privacy-safe product events
- `admin.html` / `admin.js` / `admin.css` — unlinked, administrator-only aggregate dashboard
- `supabase/migrations` — progress and analytics schema/RLS migrations
- `build-standalone.ps1` — rebuilds `index.html` for direct-file use
- `index.html` — standalone version for simple deployment or local opening

## Current product decisions

- Public name: Lumio
- Learning language: Nederlands, represented by Netherlands and Belgium flags
- Login: email and password through Supabase; guests can play locally
- Progress: saved locally and synced to the signed-in account
- Monetization: no advertising; future paid features use an adult-managed subscription
- Privacy: public privacy and deletion pages plus in-app account deletion
- Analytics: aggregate product metrics with raw events hidden by RLS
- Audience: children, with account and parent controls behind an adult gate
- First release: Dutch literacy only; no new subject modules until this experience is reliable

## Recommended next steps

1. Test sign-in and progress recovery on two devices with one account.
2. Configure or verify the GitHub Pages/hosting workflow for automatic deployment from `main`.
3. Test the flow with children and parents, then refine the confusing moments.
4. Deploy and production-test the account-deletion Edge Function.
5. Complete the Play Console Data safety, Target audience, Ads, and privacy declarations.
6. Expand Dutch curriculum quality before adding other languages or subjects.

## Updating the standalone app

After editing modular source files, run `build-standalone.ps1`, commit the modular source and rebuilt `index.html`, and publish through a GitHub pull request.
