import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { languageCatalog, languagePackages } from '../data/languages.js';
import { persianAudio } from '../data/audio-fa.js';
import { writingPaths } from '../data/writing-paths.js';
import { normalizeUserText, validateLatinName, validateLocalizedName, validateTracingText } from '../modules/input-validation.js';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const persian = languagePackages.fa;

test('normalizes surrounding and repeated whitespace', () => {
  assert.equal(normalizeUserText('  Noor\n  van   Dijk  '), 'Noor van Dijk');
});

test('profile names accept Latin names and reject wrong scripts or symbols', () => {
  for (const value of ['Noor', 'Zoë', 'Anne-Marie', "D'Angelo", 'Jean Luc']) assert.equal(validateLatinName(value).valid, true, value);
  for (const value of ['', '   ', 'علی', 'Noor123', 'Noor🙂', '张伟', '---']) assert.equal(validateLatinName(value).valid, false, value);
});

test('Persian name fields accept supported Persian names only', () => {
  for (const value of ['علی', 'فاطمه زهرا', 'میثم', 'علي']) assert.equal(validateLocalizedName(value, persian).valid, true, value);
  for (const value of ['', 'Ali', 'علی123', 'علی🙂', 'علی؟', 'علی Ali']) assert.equal(validateLocalizedName(value, persian).valid, false, value);
  assert.equal(validateLocalizedName('علي', persian).value, 'علی');
});

test('Latin custom tracing accepts sentences but rejects mixed scripts, digits, and emoji', () => {
  for (const language of [languagePackages.nl, languagePackages.en]) {
    for (const value of ['I love reading!', "Zoë's book", 'Anne-Marie reads.']) assert.equal(validateTracingText(value, language).valid, true, `${language.metadata.id}: ${value}`);
    for (const value of ['', 'علی', 'hello علی', 'word2', 'hello🙂']) assert.equal(validateTracingText(value, language).valid, false, `${language.metadata.id}: ${value}`);
  }
});

test('Persian custom tracing accepts Persian sentences and rejects mixed scripts, digits, and emoji', () => {
  for (const value of ['من کتاب می‌خوانم.', 'سلام!', 'نام تو چیست؟']) assert.equal(validateTracingText(value, persian).valid, true, value);
  for (const value of ['', 'hello', 'سلام hello', 'سلام2', 'سلام🙂']) assert.equal(validateTracingText(value, persian).valid, false, value);
});

test('language packages and Word Builders curricula are internally complete', () => {
  assert.deepEqual(languageCatalog.slice(0, 3).map(language => language.id), ['nl', 'en', 'fa']);
  for (const id of ['nl', 'en', 'fa']) {
    const language = languagePackages[id];
    assert.equal(language.metadata.id, id);
    assert.equal(language.curriculum.length, 20);
    assert.equal(language.curriculum.every(level => level.words.length === 10), true);
    const words = language.curriculum.flatMap(level => level.words.map(entry => entry.word));
    assert.equal(words.length, 200);
    assert.equal(new Set(words).size, 200);
    const missingPaths = language.writing.flatMap(drill => drill.forms.filter(form => !writingPaths[form.pathId]));
    assert.equal(missingPaths.length, 0);
  }
});

test('every service-worker asset exists and the standalone builder embeds validation', async () => {
  const worker = await readFile(resolve(root, 'service-worker.js'), 'utf8');
  const assetsMatch = worker.match(/const ASSETS = \[(.*?)\];/s);
  assert.ok(assetsMatch);
  const assets = [...assetsMatch[1].matchAll(/'([^']+)'/g)].map(match => match[1]).filter(asset => !['./', './index.html'].includes(asset));
  for (const asset of assets) await assert.doesNotReject(() => readFile(resolve(root, asset.replace(/^\.\//, ''))), asset);
  const builder = await readFile(resolve(root, 'build-standalone.ps1'), 'utf8');
  assert.match(builder, /input-validation\.js/);
  assert.match(builder, /analytics\.js/);
  const app = await readFile(resolve(root, 'app.js'), 'utf8');
  assert.match(app, /validateLatinName/);
  assert.match(app, /validateLocalizedName/);
  assert.match(app, /validateTracingText/);
});

test('all explicit navigation destinations are handled by the main renderer', async () => {
  const app = await readFile(resolve(root, 'app.js'), 'utf8');
  const assignedViews = new Set([...app.matchAll(/view\s*=\s*'([^']+)'/g)].map(match => match[1]));
  const handledViews = new Set([...app.matchAll(/view\s*===\s*'([^']+)'/g)].map(match => match[1]));
  const fallbackViews = new Set(['home']);
  const unhandled = [...assignedViews].filter(view => !handledViews.has(view) && !fallbackViews.has(view));
  assert.deepEqual(unhandled, []);
  for (const required of ['app-language', 'auth', 'adult-confirmation', 'child-name', 'languages', 'games', 'letters', 'custom-tracing-input', 'tracing', 'game', 'number-house-levels', 'number-houses', 'templates', 'parent']) assert.equal(handledViews.has(required), true, required);
});

test('every user text field has an explicit validation path', async () => {
  const app = await readFile(resolve(root, 'app.js'), 'utf8');
  assert.match(app, /id="child-name"[\s\S]*?validateLatinName/);
  assert.match(app, /data-localized-name[\s\S]*?validateLocalizedName/);
  assert.match(app, /id="custom-tracing-text"[\s\S]*?validateTracingText/);
  assert.match(app, /id="localized-name"[\s\S]*?validateLocalizedName/);
  assert.match(app, /type="email"/);
  assert.match(app, /type="password" minlength="4"/);
});

test('generated standalone app contains the same validation and release', async () => {
  const standalone = await readFile(resolve(root, 'index.html'), 'utf8');
  assert.match(standalone, /const RELEASE = '0\.8\.2'/);
  assert.match(standalone, /function validateLatinName/);
  assert.match(standalone, /function validateLocalizedName/);
  assert.match(standalone, /function validateTracingText/);
  assert.match(standalone, /id="localized-name-error"/);
  assert.doesNotMatch(standalone, /<script type="module" src="app\.js"><\/script>/);
});

test('long tracing text scrolls everywhere except on the tracing handle', async () => {
  const css = await readFile(resolve(root, 'games.css'), 'utf8');
  const app = await readFile(resolve(root, 'app.js'), 'utf8');
  assert.match(css, /\.name-stage\{[^}]*touch-action:pan-x pan-y/);
  assert.match(css, /\.name-stage \.name-svg\{touch-action:pan-x pan-y\}/);
  assert.match(css, /\.name-stage \.trace-dot\{touch-action:none\}/);
  assert.match(app, /class="trace-stage name-stage" dir="\$\{nameDirection\}"/);
  assert.match(app, /class="trace-scroll-hint"/);
  assert.match(app, /dot\.addEventListener\('pointerdown', startDrag\)/);
  assert.doesNotMatch(app, /svg\.addEventListener\('pointerdown'/);
});

test('each name and custom-text letter scrolls its matching glyph into view', async () => {
  const css = await readFile(resolve(root, 'games.css'), 'utf8');
  const app = await readFile(resolve(root, 'app.js'), 'utf8');
  assert.match(app, /<button type="button" class="name-progress-letter" data-name-letter="\$\{index\}"/);
  assert.match(app, /data-name-letter-target="\$\{letterIndex\}"/);
  assert.match(app, /scrollIntoView\(\{ behavior: 'smooth', block: 'nearest', inline: 'center' \}\)/);
  assert.match(css, /\.name-progress-letter\{[^}]*cursor:pointer/);
  assert.match(css, /\.name-progress-letter:focus-visible/);
});

test('the persistent sound toggle silences current and future voices on every page', async () => {
  const app = await readFile(resolve(root, 'app.js'), 'utf8');
  const storage = await readFile(resolve(root, 'modules/storage.js'), 'utf8');
  assert.match(storage, /soundEnabled: true/);
  assert.match(app, /function stopAllAudio\(\).*audioPlaybackToken \+= 1;.*activeAudio\?\.pause\(\).*speechSynthesis\.cancel\(\)/s);
  assert.match(app, /function speakWithSystemVoice\(text, locale\) \{\s*if \(!soundEnabled\(\)/);
  assert.match(app, /function speak\(text, locale = pack\(\)\?\.metadata\.locale\) \{\s*if \(!soundEnabled\(\)\) return;/);
  assert.match(app, /\$\{soundButton\(false\)\}/);
  assert.match(app, /if \(!root\.querySelector\('\[data-action="sound-toggle"\]'\)\) root\.insertAdjacentHTML\('beforeend', soundButton\(true\)\)/);
  assert.match(app, /soundEnabled: !soundEnabled\(\)/);
});

test('tracing uses a larger invisible grab target that follows the visible handle', async () => {
  const app = await readFile(resolve(root, 'app.js'), 'utf8');
  const css = await readFile(resolve(root, 'games.css'), 'utf8');
  assert.equal((app.match(/id="trace-hit-area" class="trace-hit-area" r="34"/g) || []).length, 2);
  assert.match(app, /place\(dot, samples\[0\]\); place\(hitArea, samples\[0\]\)/);
  assert.match(app, /place\(dot, tracingSession\.samples\[index\]\); place\(hitArea, tracingSession\.samples\[index\]\)/);
  assert.match(app, /hitArea\.addEventListener\('pointerdown', startDrag\)/);
  assert.match(css, /\.trace-hit-area\{[^}]*fill:transparent[^}]*pointer-events:all[^}]*touch-action:none/);
});

test('math screen and voices use the correct operation-specific instruction', async () => {
  const app = await readFile(resolve(root, 'app.js'), 'utf8');
  for (const key of ['guideTotalAddition', 'guideTotalMultiplication', 'guideMissingAddition', 'guideMissingMultiplication', 'retryTotalAddition', 'retryTotalMultiplication', 'retryMissing', 'resultAddition', 'resultMultiplication']) {
    assert.equal((app.match(new RegExp(`${key}:`, 'g')) || []).length, 3, key);
  }
  assert.match(app, /function mathGuide\(house, level\)[\s\S]*house\.missing === 'total'[\s\S]*guideTotalMultiplication'[\s\S]*guideTotalAddition'[\s\S]*guideMissingMultiplication'[\s\S]*guideMissingAddition'/);
  assert.match(app, /const instruction = mathGuide\(house, level\)/);
  assert.match(app, /class="number-house-prompt">\$\{escape\(instruction\)\}/);
  assert.match(app, /root\.querySelector\('\[data-action="listen-math"\]'\)\.onclick = \(\) => speakMath\(instruction\)/);
  assert.match(app, /setTimeout\(\(\) => speakMath\(instruction\), 180\)/);
  assert.match(app, /const retryGuide = mathRetryGuide\(numberHouseSession\.house, level\)/);
  assert.match(app, /feedback\.textContent = mathResultGuide\(numberHouseSession\.house, level\)/);
  assert.doesNotMatch(app, /number-house-prompt">\$\{math\.prompt\}/);
});

test('account creation is concise and every cloud account receives the adult check', async () => {
  const app = await readFile(resolve(root, 'app.js'), 'utf8');
  const cloud = await readFile(resolve(root, 'modules/cloud.js'), 'utf8');
  assert.match(app, /const googleAuthCopy = \{[\s\S]*nl:[\s\S]*en:[\s\S]*fa:/);
  assert.equal((app.match(/\$\{googleLoginButton\(googleText\)\}/g) || []).length, 1);
  assert.match(app, /pendingSignUp = \{ email, password \}; view = 'adult-confirmation'/);
  assert.match(app, /function renderAdultConfirmation\(\)/);
  assert.match(app, /if \(!hasAdultConfirmation\(cloudUser\)\) \{ view = 'adult-confirmation'/);
  assert.match(app, /function bindGoogleLogin\(googleText\)[\s\S]*await signInWithGoogle\(\)/);
  assert.match(app, /bindGoogleLogin\(googleText\)/);
  assert.doesNotMatch(app, /id="parent-consent"/);
  assert.match(cloud, /auth\.updateUser\([\s\S]*lumio_adult_confirmed: true/);
  assert.match(cloud, /signUp\(email, password, adultConfirmed = false\)[\s\S]*lumio_adult_confirmed: true/);
  assert.equal((app.match(/<svg viewBox="0 0 24 24" aria-hidden="true">/g) || []).length, 1);
  assert.match(cloud, /signInWithOAuth\(\{ provider: 'google', options: \{ redirectTo \} \}\)/);
  assert.match(cloud, /redirectTo = `\$\{window\.location\.origin\}\$\{window\.location\.pathname\}`/);
});

test('the header always offers the correct account action', async () => {
  const app = await readFile(resolve(root, 'app.js'), 'utf8');
  const css = await readFile(resolve(root, 'games.css'), 'utf8');
  assert.match(app, /if \(cloudUser\)[\s\S]*dataset\.action = 'signout'[\s\S]*button\.textContent = copy\(\)\.signOut/);
  assert.match(app, /else \{[\s\S]*dataset\.action = 'signin'[\s\S]*button\.textContent = copy\(\)\.logIn/);
  assert.match(app, /\[data-action="signin"\][\s\S]*authMode = 'login'; view = 'auth'/);
  assert.match(app, /view = returnView \|\| \(profile\.childName/);
  assert.match(css, /\.account-session-action\{white-space:nowrap;cursor:pointer\}/);
});

test('analytics is privacy-minimized, failure-isolated, and admin-only', async () => {
  const analytics = await readFile(resolve(root, 'modules/analytics.js'), 'utf8');
  const app = await readFile(resolve(root, 'app.js'), 'utf8');
  const migration = await readFile(resolve(root, 'supabase/migrations/20260815153200_add_privacy_safe_analytics.sql'), 'utf8');
  const admin = await readFile(resolve(root, 'admin.js'), 'utf8');
  const childShell = await readFile(resolve(root, 'index.template.html'), 'utf8');
  for (const event of ['first_open', 'session_start', 'language_selected', 'lesson_started', 'lesson_completed', 'game_started', 'game_completed', 'curriculum_progress', 'support_viewed', 'support_clicked']) {
    assert.match(analytics, new RegExp(`['"]${event}['"]`), event);
  }
  assert.match(analytics, /crypto\?\.randomUUID/);
  assert.match(analytics, /queueMicrotask/);
  assert.match(analytics, /\.catch\(\(\) => \{\}\)/);
  assert.doesNotMatch(analytics, /childName|email|birth|location|latitude|longitude|advertising/i);
  assert.match(app, /trackEvent\('curriculum_progress'/);
  assert.match(migration, /enable row level security/i);
  assert.match(migration, /grant insert on table public\.analytics_events to anon, authenticated/i);
  assert.doesNotMatch(migration, /grant select on table public\.analytics_events to (?:anon|authenticated)/i);
  assert.match(migration, /auth\.jwt\(\) -> 'app_metadata' ->> 'lumio_admin'/);
  assert.match(migration, /revoke all on function public\.get_lumio_analytics_dashboard\(\) from public, anon/i);
  assert.match(admin, /rpc\('get_lumio_analytics_dashboard'/);
  assert.doesNotMatch(admin, /service[_-]?role|secret[_-]?key/i);
  assert.doesNotMatch(childShell, /admin\.html/i);
  assert.match(app, /cloudUser\?\.app_metadata\?\.lumio_admin === true/);
  assert.match(app, /href="admin\.html"/);
  const adminHtml = await readFile(resolve(root, 'admin.html'), 'utf8');
  assert.match(adminHtml, /href="\.\/" class="secondary view-link">User view/);
});

test('advertising controls are removed and subscription information stays in the parent area', async () => {
  const app = await readFile(resolve(root, 'app.js'), 'utf8');
  const storage = await readFile(resolve(root, 'modules/storage.js'), 'utf8');
  const languages = await readFile(resolve(root, 'data/languages.js'), 'utf8');
  assert.doesNotMatch(storage, /adsEnabled/);
  assert.doesNotMatch(languages, /adSetting|adMessage/);
  assert.doesNotMatch(app, /id="ads"|preferences\.adsEnabled/);
  assert.match(app, /subscriptionNote:'Lumio has no ads/);
});

test('publishing privacy, deletion, and Data safety resources are present', async () => {
  const [app, cloud, privacy, deletion, dataSafety, edgeFunction] = await Promise.all([
    readFile(resolve(root, 'app.js'), 'utf8'),
    readFile(resolve(root, 'modules/cloud.js'), 'utf8'),
    readFile(resolve(root, 'privacy.html'), 'utf8'),
    readFile(resolve(root, 'account-deletion.html'), 'utf8'),
    readFile(resolve(root, 'GOOGLE_PLAY_DATA_SAFETY.md'), 'utf8'),
    readFile(resolve(root, 'supabase/functions/delete-account/index.ts'), 'utf8'),
  ]);
  assert.match(app, /view === 'adult-gate'/);
  assert.match(app, /view === 'adult-confirmation'/);
  assert.match(app, /view === 'delete-account'/);
  assert.match(app, /href="privacy\.html"/);
  assert.match(cloud, /functions\.invoke\('delete-account'/);
  assert.match(privacy, /Retention and deletion/);
  assert.match(privacy, /at least 18/);
  assert.match(privacy, /does not collect a date of birth/);
  assert.match(deletion, /Delete your account and data/);
  assert.match(dataSafety, /Adult email address/);
  assert.match(edgeFunction, /auth\.admin\.deleteUser\(user\.id, false\)/);
  assert.doesNotMatch(edgeFunction, /sb_service_role|service_role_/);
});

test('cloud progress is isolated by user, language, and activity', async () => {
  const [app, cloud, storage] = await Promise.all([
    readFile(resolve(root, 'app.js'), 'utf8'),
    readFile(resolve(root, 'modules/cloud.js'), 'utf8'),
    readFile(resolve(root, 'modules/storage.js'), 'utf8'),
  ]);
  assert.match(cloud, /\.eq\('language_id', languageId\)/);
  assert.match(cloud, /\.eq\('activity', activity\)/);
  assert.match(cloud, /onConflict: 'user_id,language_id,activity,level'/);
  assert.match(app, /word_builders/);
  assert.match(app, /tracing: 'tracing'/);
  assert.match(app, /math: 'math'/);
  assert.doesNotMatch(app, /LEVEL_OFFSET/);
  assert.match(storage, /mathProgressByLanguage/);
});

test('database migration enforces account ownership and least privilege', async () => {
  const [migration, cleanup] = await Promise.all([
    readFile(resolve(root, 'supabase/migrations/20260815143733_isolate_progress_by_language_and_activity.sql'), 'utf8'),
    readFile(resolve(root, 'supabase/migrations/20260815144148_remove_legacy_progress_policies.sql'), 'utf8'),
  ]);
  assert.match(migration, /primary key \(user_id, language_id, activity, level\)/);
  assert.match(migration, /enable row level security/);
  assert.equal((migration.match(/\(select auth\.uid\(\)\) = user_id/g) || []).length, 4);
  assert.match(migration, /for update[\s\S]*using[\s\S]*with check/);
  assert.match(migration, /revoke all on table public\.user_progress from anon, authenticated/);
  assert.match(migration, /grant select, insert, update on table public\.user_progress to authenticated/);
  assert.equal((cleanup.match(/drop policy if exists/g) || []).length, 3);
});

test('Persian recorder separates new, replacement, and second-person voice jobs', async () => {
  const recorder = await readFile(resolve(root, 'tools/persian-audio-recorder.html'), 'utf8');
  const glossaryWords = [...new Set(persian.curriculum.flatMap(level => level.words.map(entry => entry.word)))];
  const missingWords = glossaryWords.filter(word => !persianAudio[word]);
  assert.equal(missingWords.length, 140);
  assert.match(recorder, /languagePackages\.fa\.curriculum/);
  assert.match(recorder, /filter\(text => !persianAudio\[text\]\)/);
  assert.match(recorder, /Object\.entries\(persianAudio\)/);
  assert.match(recorder, /'new-primary'/);
  assert.match(recorder, /'replace-primary'/);
  assert.match(recorder, /'second-voice'/);
  assert.match(recorder, /assets\/audio\/fa-voice-2/);
  assert.match(recorder, /lumio-fa-recorder-\$\{name\}:\$\{mode\}/);
  assert.match(recorder, /directoryHandle=null/);
  await assert.doesNotReject(() => readFile(resolve(root, 'assets/audio/fa-voice-2/README.md'), 'utf8'));
});
