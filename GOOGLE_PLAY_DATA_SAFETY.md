# Google Play Data safety working declaration

Use this document when completing Play Console. Re-check every answer against the final Android wrapper, SDK list, Supabase configuration, and production behavior before submitting.

## Collection and sharing

- **Does the app collect data?** Yes. Minimal product analytics are sent for guests and signed-in users; an adult email address and cloud progress are sent only for an optional account.
- **Does the app share data?** No for advertising or third-party commercial purposes. Supabase, the hosting/CDN provider, and optional Google sign-in act as service providers. Confirm Play's current service-provider exceptions when filing.
- **Is all collected data encrypted in transit?** Yes, production endpoints must use HTTPS.
- **Can users request deletion?** Yes, through Parent settings → Delete account and through the public `account-deletion.html` URL.
- **Is account creation optional?** Yes. Guest mode works without an online account.

## Data types to declare

| Play category | Data | Collected? | Purpose | Required? |
| --- | --- | --- | --- | --- |
| Personal info | Adult email address | Yes | Account management and authentication | Optional |
| Personal info | User ID | Yes | Account management and linking progress | Optional |
| App activity | Learning progress / in-app activity | Yes | App functionality and cross-device progress | Optional |
| Device or other IDs | Random Lumio installation identifier | Yes | Aggregate analytics, fraud/integrity, and retention measurement | Required for analytics; not an advertising ID |
| App activity | Lesson/game starts, completions, language, and support interactions | Yes | Product analytics | Required for analytics |

The child’s first name, names in other scripts, preferences, stars, streak, and local progress are currently stored only on the device. Under Google Play’s definition, on-device-only processing is not “collected” because it is not transmitted off the device. Reclassify these immediately if cloud sync later uploads them.

Passwords are handled by Supabase Auth and are not visible to Lumio. Confirm with Play Console guidance whether authentication information must be declared separately for the final Android implementation.

## Data handling commitments

- No advertising SDK and no `AD_ID` permission.
- No names, user-entered lesson text, precise location, birth dates, or per-tap clickstream in analytics.
- No sale, behavioural advertising, remarketing, or advertising profiling.
- Adult-managed accounts and consent; child learning remains available in guest mode.
- Active account and progress deletion through the authenticated Edge Function.
- Retention: local data until cleared/uninstalled; active cloud data until account deletion; residual secured backups/security logs for no more than 30 days unless legally required.

## Third-party review before submission

Record every SDK in the final AAB, including the Trusted Web Activity or WebView wrapper, billing library, crash reporting, analytics, hosting, Supabase, Google OAuth, and CDN behavior. The Data safety form covers the sum of all versions and regions distributed under the package name.
