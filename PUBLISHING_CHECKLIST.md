# Lumio Google Play publishing checklist

## Required before release

- [x] Deploy `supabase/functions/delete-account` to project `qmtzmlpgsvtietkqgwnb` (version 1 active on 15 August 2026; unauthenticated requests verified to return 401).
- [ ] Test in-app deletion and `account-deletion.html` using a disposable production account; verify the Auth user and every `user_progress` row are gone.
- [ ] Publish `privacy.html` and `account-deletion.html` on stable public HTTPS URLs.
- [ ] Enter the privacy-policy URL and web deletion URL in Play Console.
- [ ] Complete Data safety using `GOOGLE_PLAY_DATA_SAFETY.md`, updated for the final Android SDK list.
- [ ] Declare that the app contains no ads.
- [ ] Declare the actual child target age groups (the current learning design is consistent with ages 5 and under and/or 6–8; choose only groups intentionally designed and tested for).
- [ ] Complete the Families, content-rating, and app-access sections accurately.
- [ ] Ensure the Android manifest does not request `com.google.android.gms.permission.AD_ID`, location, contacts, camera, microphone, or other permissions Lumio does not need.
- [ ] Put subscription purchase, restore, cancellation, pricing, and external links only behind the adult gate.
- [x] Add a monitored, private support/privacy email to the store listing and privacy policy before publication; the public issue tracker is not suitable for personal-data support.

## Release verification

- [ ] Guest mode works without account creation or personal-data transmission to Supabase.
- [ ] Account creation clearly states that an adult owns the account and records the consent checkbox.
- [ ] Parent settings, sign-in/sign-out, subscription messaging, and deletion remain behind the adult gate.
- [ ] No ad banner, ad setting, ad SDK, ad identifier, or advertising copy remains in the shipped bundle.
- [ ] Privacy and deletion links open from the parent area and from a normal browser outside the app.
- [x] RLS on `user_progress` restricts select, insert, and update to `auth.uid() = user_id`; account deletion uses the authenticated server function rather than a client delete policy.
- [ ] Enable Supabase Auth leaked-password protection. The security advisor reported it disabled on 15 August 2026: https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection
- [ ] Review the final app with legal/privacy counsel for COPPA, GDPR/UK GDPR age-of-consent rules, and every country where it will be offered.

Preparing these files does not itself complete the Play Console declarations or deploy the server-side deletion function.
