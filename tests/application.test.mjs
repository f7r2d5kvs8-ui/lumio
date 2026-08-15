import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';
import { languageCatalog, languagePackages } from '../data/languages.js';
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
  for (const required of ['app-language', 'auth', 'child-name', 'languages', 'games', 'letters', 'custom-tracing-input', 'tracing', 'game', 'number-house-levels', 'number-houses', 'templates', 'parent']) assert.equal(handledViews.has(required), true, required);
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
  assert.match(standalone, /const RELEASE = '0\.7\.10'/);
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

test('Google sign-in is available on the first welcome screen and reuses the existing OAuth flow', async () => {
  const app = await readFile(resolve(root, 'app.js'), 'utf8');
  const cloud = await readFile(resolve(root, 'modules/cloud.js'), 'utf8');
  assert.match(app, /const googleAuthCopy = \{[\s\S]*nl:[\s\S]*en:[\s\S]*fa:/);
  assert.equal((app.match(/\$\{googleLoginButton\(googleText\)\}/g) || []).length, 2);
  assert.match(app, /if \(choosing\) \{[\s\S]*\$\{googleLoginButton\(googleText\)\}[\s\S]*id="auth-message"[\s\S]*bindGoogleLogin\(googleText\)/);
  assert.match(app, /function bindGoogleLogin\(googleText\)[\s\S]*await signInWithGoogle\(\)/);
  assert.equal((app.match(/<svg viewBox="0 0 24 24" aria-hidden="true">/g) || []).length, 1);
  assert.match(cloud, /signInWithOAuth\(\{ provider: 'google', options: \{ redirectTo \} \}\)/);
  assert.match(cloud, /redirectTo = `\$\{window\.location\.origin\}\$\{window\.location\.pathname\}`/);
});
