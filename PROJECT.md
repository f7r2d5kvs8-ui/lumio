# Lumio

Lumio is a child-friendly literacy platform. The current release focuses on Dutch reading and word building, while the architecture is prepared for future languages and subjects.

## Live services

- Website: https://lumiolearning.netlify.app/
- Authentication and progress: Supabase project `qmtzmlpgsvtietkqgwnb`
- Deployment: Netlify manual deploy, pending a future GitHub connection

## Source layout

- `index.template.html` — hosted modular app shell
- `app.js` — screens, learning flow, and interactions
- `styles.css` — visual design and responsive layout
- `data/languages.js` — language package and Dutch curriculum
- `modules/storage.js` — local profile and offline progress
- `modules/cloud.js` — Supabase sign-in and cloud progress
- `build-standalone.ps1` — rebuilds `index.html` for direct-file use
- `index.html` — standalone version for simple deployment or local opening

## Current product decisions

- Public name: Lumio
- Learning language: Nederlands, represented by Netherlands and Belgium flags
- Login: email and password through Supabase; guests can play locally
- Progress: saved locally and synced to the signed-in account
- First release: Dutch literacy only; no new subject modules until this experience is reliable

## Recommended next steps

1. Test sign-in and progress recovery on two devices with one account.
2. Connect the folder to a private GitHub repository and connect Netlify to that repository.
3. Test the flow with children and parents, then refine the confusing moments.
4. Expand Dutch curriculum quality before adding other languages or subjects.

## Updating the standalone app

After editing modular source files, run `build-standalone.ps1`. Upload the resulting `index.html` and supporting files to Netlify, or use the generated deployment ZIP.
