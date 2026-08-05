import { languageCatalog, languagePackages } from './data/languages.js';
import { writingPaths } from './data/writing-paths.js';
import { loadProfile, saveProfile, languageProgress, updateLanguageProgress, rewardPractice } from './modules/storage.js';
import { currentSession, signUp, signIn, signOut, readProgress, writeProgress } from './modules/cloud.js';

const root = document.querySelector('#app');
let profile = loadProfile();
let view = profile.account ? (profile.selectedLanguage ? 'home' : 'languages') : 'auth';
let session = null;
let languageTarget = 'learning';
let authMode = 'choice';
let cloudUser = null;
let tracingSession = null;
const TRACE_LEVEL_OFFSET = 100;

const escape = value => String(value).replace(/[&<>"]/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[char]));
const shuffle = values => [...values].sort(() => Math.random() - .5);
const pack = () => languagePackages[profile.learningLanguage || profile.selectedLanguage];
const ui = () => pack().ui;
const baseUi = () => languagePackages.nl.ui;
const languageFlags = language => `<span class="flag-set" aria-label="${escape(language.name)}">${(language.flagCodes || []).map(code => `<span class="country-flag flag-${code}" aria-hidden="true"></span>`).join('')}</span>`;
const games = () => pack()?.games || [];

function speak(text, locale = pack()?.metadata.locale) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const say = () => { const voices = speechSynthesis.getVoices(); const languageCode = locale?.split('-')[0]?.toLowerCase(); const voice = voices.find(item => item.lang.toLowerCase().startsWith(languageCode)) || voices.find(item => item.name.toLowerCase().includes(languageCode === 'fa' ? 'persian' : languageCode)); const utterance = new SpeechSynthesisUtterance(text); utterance.lang = voice?.lang || locale || document.documentElement.lang; utterance.rate = .78; if (voice) utterance.voice = voice; speechSynthesis.resume(); speechSynthesis.speak(utterance); };
  speechSynthesis.getVoices().length ? say() : speechSynthesis.addEventListener('voiceschanged', say, { once: true });
}

async function syncCloudProgress() { const language = pack(); if (!cloudUser || !language) return; const rows = (await readProgress(cloudUser.id)).filter(row => row.level >= 1 && row.level <= language.curriculum.length); const progress = languageProgress(profile, language.metadata.id); if (!rows.length && (progress.completed.length || progress.wordIndex)) { for (const lessonIndex of progress.completed) await writeProgress(cloudUser.id, lessonIndex + 1, 0, true); await writeProgress(cloudUser.id, progress.activeLesson + 1, progress.wordIndex || 0, progress.completed.includes(progress.activeLesson)); return; } const completed = rows.filter(row => row.completed).map(row => row.level - 1); const active = rows.filter(row => !row.completed).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0]; updateLanguageProgress(profile, language.metadata.id, { completed, activeLesson: active ? Math.max(0, active.level - 1) : progress.activeLesson, wordIndex: active?.word_index || 0 }); }
async function persistCloudProgress() { if (!cloudUser || !pack() || !session) return; const progress = languageProgress(profile, pack().metadata.id); const currentLevel = session.lessonIndex + 1; await writeProgress(cloudUser.id, currentLevel, progress.activeLesson === session.lessonIndex ? progress.wordIndex : 0, progress.completed.includes(session.lessonIndex)); }
async function syncTracingProgress() { if (!cloudUser || !pack()?.writing?.length) return; const rows = await readProgress(cloudUser.id); const tracingCompleted = rows.filter(row => row.level > TRACE_LEVEL_OFFSET && row.level <= TRACE_LEVEL_OFFSET + pack().writing.length && row.completed).map(row => pack().writing[row.level - TRACE_LEVEL_OFFSET - 1]?.id).filter(Boolean); if (tracingCompleted.length) { const progress = languageProgress(profile, pack().metadata.id); updateLanguageProgress(profile, pack().metadata.id, { tracingCompleted: [...new Set([...(progress.tracingCompleted || []), ...tracingCompleted])] }); } }
async function persistTracingProgress(drillId) { if (!cloudUser || !pack()?.writing?.length) return; const index = pack().writing.findIndex(item => item.id === drillId); if (index >= 0) await writeProgress(cloudUser.id, TRACE_LEVEL_OFFSET + index + 1, 0, true); }
function renderAuth() {
  const choosing = authMode === 'choice';
  const login = authMode === 'login';
  if (choosing) {
    root.innerHTML = `<main class="screen account-screen"><section class="hero auth-choice"><div class="eyebrow">Lumio</div><h1>Welkom!</h1><p>Begin jouw leeravontuur.</p><div class="account-choices"><button class="choice-button guest-choice" data-action="guest"><span class="choice-icon" aria-hidden="true">▶</span><span><strong>Speel als gast</strong><small>Begin meteen met oefenen</small></span></button><button class="choice-button account-choice" data-action="signup"><span class="choice-icon" aria-hidden="true">★</span><span><strong>Maak een account</strong><small>Bewaar jouw voortgang</small></span></button></div><button class="login-link" data-action="login">Al een account? <strong>Log in</strong></button></section></main>`;
    root.querySelector('[data-action="signup"]').addEventListener('click', () => { authMode = 'signup'; render(); });
    root.querySelector('[data-action="login"]').addEventListener('click', () => { authMode = 'login'; render(); });
    root.querySelector('[data-action="guest"]').addEventListener('click', () => { cloudUser = null; profile.account = null; saveProfile(profile); view = 'languages'; render(); });
    return;
  }
  root.innerHTML = `<main class="screen account-screen"><section class="hero auth-form-card"><button class="back-auth" data-action="back-auth" aria-label="Terug">←</button><div class="eyebrow">Lumio</div><h1>${login ? 'Welkom terug' : 'Maak een account'}</h1><p>${login ? 'Ga verder met jouw leerreis.' : 'Bewaar de groei van je leerheld voor later.'}</p><form id="auth-form" class="auth-form"><label>E-mailadres<input id="auth-email" type="email" autocomplete="email" required placeholder="jij@voorbeeld.nl"></label><label>Wachtwoord<input id="auth-password" type="password" minlength="4" required placeholder="minimaal 4 tekens"></label><button class="button primary" type="submit">${login ? 'Inloggen' : 'Account maken'}</button></form><p class="auth-message" id="auth-message"></p><button class="login-link" data-action="auth-mode">${login ? 'Nog geen account? Maak er een' : 'Al een account? Log in'}</button></section></main>`;
  root.querySelector('#auth-form').addEventListener('submit', async event => { event.preventDefault(); const email = root.querySelector('#auth-email').value.trim().toLowerCase(); const password = root.querySelector('#auth-password').value; const message = root.querySelector('#auth-message'); message.textContent = login ? 'Inloggen…' : 'Account maken…'; const result = login ? await signIn(email, password) : await signUp(email, password); if (result.error) { message.textContent = result.error.message; return; } if (!result.data.session) { message.textContent = 'Controleer je e-mail en bevestig je account. Daarna kun je inloggen.'; return; } cloudUser = result.data.user; profile.account = { email, provider: 'supabase' }; saveProfile(profile); await syncCloudProgress(); await syncTracingProgress(); view = profile.selectedLanguage ? (profile.selectedGame === 'letter-trail' ? 'letters' : profile.selectedGame ? 'home' : 'games') : 'languages'; render(); });
  root.querySelector('[data-action="auth-mode"]').addEventListener('click', () => { authMode = login ? 'signup' : 'login'; render(); });
  root.querySelector('[data-action="back-auth"]').addEventListener('click', () => { authMode = 'choice'; render(); });
}

function header() { return `<header class="topbar"><button class="brand" data-action="languages" aria-label="Lumio">Lu<span>mio</span></button><div class="stat-row"><button class="chip" data-action="parent" aria-label="Ouders">👨‍👩‍👧</button><span class="chip">🔥 ${profile.rewards.streak || 0}</span><span class="chip">⭐ ${profile.rewards.stars || 0}</span></div></header>`; }

function renderLanguages() {
  const text = baseUi();
  root.innerHTML = `<main class="screen"><section class="hero"><div class="eyebrow">Lumio</div><h1>${text.chooseWorld}</h1><p>${text.languageIntro}</p><div class="language-grid">${languageCatalog.map(language => { const unavailable = language.status !== 'ready' && languageTarget !== 'native'; return `<article class="language-card"><button class="language-select" data-language="${language.id}" ${unavailable ? 'disabled' : ''}>${languageFlags(language)}<strong>${escape(language.nativeName)}</strong>${unavailable ? `<span class="badge">${text.comingSoon}</span>` : ''}</button><button class="speaker" data-say="${language.id}" aria-label="${text.listen} ${escape(language.nativeName)}">🔊</button></article>`; }).join('')}</div></section></main>`;
  root.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', () => { const id = button.dataset.language; if (languageTarget === 'native') profile.homeLanguage = id; else { profile.selectedLanguage = id; profile.learningLanguage = id; profile.selectedGame = null; } saveProfile(profile); view = languageTarget === 'native' ? 'home' : 'games'; languageTarget = 'learning'; speak(languageCatalog.find(item => item.id === id).nativeName, languageCatalog.find(item => item.id === id).locale); render(); }));
  root.querySelectorAll('[data-say]').forEach(button => button.addEventListener('click', () => { const language = languageCatalog.find(item => item.id === button.dataset.say); speak(language.nativeName, language.locale); }));
}

function renderGames() {
  const language = pack(); const text = ui();
  root.innerHTML = `${header()}<main class="screen"><section class="hero game-picker"><button class="back game-picker-back" data-action="languages">← ${text.back}</button><div class="eyebrow">${language.metadata.nativeName}</div><h1>Kies een spel</h1><p>Kies hoe je vandaag wilt oefenen.</p><div class="game-grid">${games().map(game => `<button class="game-choice ${game.status !== 'ready' ? 'coming-soon' : ''}" data-game="${game.id}" ${game.status !== 'ready' ? 'disabled aria-disabled="true"' : ''}><span class="game-choice-icon" aria-hidden="true">${game.icon}</span><span><strong>${game.title}</strong><small>${game.description}</small></span>${game.status !== 'ready' ? `<em>${text.comingSoon}</em>` : '<span class="game-choice-arrow" aria-hidden="true">→</span>'}</button>`).join('')}</div></section></main>${adBanner()}`;
  root.querySelector('[data-action="languages"]').addEventListener('click', () => { view = 'languages'; render(); });
  root.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => { profile.selectedGame = button.dataset.game; saveProfile(profile); if (button.dataset.game === 'letter-trail') { view = 'letters'; render(); } else { view = 'home'; render(); } }));
  bindHeader();
}

function renderLetters() {
  const language = pack(); const progress = languageProgress(profile, language.metadata.id); const completed = progress.tracingCompleted || []; const lessonDone = drill => drill.forms.every(form => completed.includes(form.id)); const doneCount = language.writing.filter(lessonDone).length;
  root.innerHTML = `${header()}<main class="screen"><section class="hero letter-picker"><button class="back game-picker-back" data-action="games">← Spellen</button><div class="eyebrow">Letterspoor</div><h1>Kies een letter</h1><p>Oefen telkens de hoofdletter én de kleine letter.</p><div class="trace-total"><span>${doneCount} / ${language.writing.length} letters geoefend</span><div class="progress"><span style="width:${doneCount / language.writing.length * 100}%"></span></div></div><div class="letter-picker-grid">${language.writing.map(drill => `<button class="letter-choice ${lessonDone(drill) ? 'done' : ''}" data-trace-letter="${drill.id}" aria-label="Oefen letter ${drill.letter} en ${drill.lowercase}"><strong>${drill.letter}<small>${drill.lowercase}</small></strong>${lessonDone(drill) ? '<span>✓</span>' : ''}</button>`).join('')}</div><button class="button primary alphabet-next" data-action="alphabet-next" ${doneCount === language.writing.length ? '' : 'disabled'}>Volgende →</button></section></main>${adBanner()}`;
  root.querySelector('[data-action="games"]').addEventListener('click', () => { view = 'games'; render(); });
  root.querySelectorAll('[data-trace-letter]').forEach(button => button.addEventListener('click', () => startTracing(button.dataset.traceLetter)));
  root.querySelector('[data-action="alphabet-next"]').addEventListener('click', () => { profile.selectedGame = 'word-builder'; saveProfile(profile); view = 'home'; render(); });
  bindHeader();
}

function startTracing(drillId, formIndex = 0) {
  const drill = pack().writing?.find(item => item.id === drillId) || pack().writing?.[0];
  const form = drill?.forms?.[formIndex]; if (!drill || !form || !writingPaths[form.pathId]) { view = 'games'; render(); return; }
  tracingSession = { drill, form, formIndex, path: writingPaths[form.pathId], dragging: false, completed: false, strokeIndex: 0, furthest: 0 };
  view = 'tracing'; render();
}

function renderTracing() {
  const { drill, path } = tracingSession;
  root.innerHTML = `${header()}<main class="screen tracing-screen"><div class="game-head"><button class="back" data-action="letters">← Letters</button><span class="count">${drill.title}</span></div><section class="tracing-card"><div class="eyebrow">Letterspoor</div><h1>Volg de letter ${drill.letter}</h1><p>Luister naar de klank. Houd de cirkel vast en volg het grijze spoor.</p><div class="trace-stage"><svg id="trace-svg" viewBox="${path.viewBox}" role="img" aria-label="Volg de hoofdletter ${drill.letter}">${path.strokes.map((stroke, index) => `<path class="trace-shadow" d="${stroke}"/><path class="trace-progress" data-trace-progress="${index}" d="${stroke}"/>`).join('')}<circle id="trace-start" class="trace-marker start" r="13"/><circle id="trace-end" class="trace-marker end" r="13"/><circle id="trace-dot" class="trace-dot" r="17" tabindex="0" role="button" aria-label="Sleep de cirkel over de letter ${drill.letter}"/></svg></div><p id="trace-feedback" class="feedback">Luister en begin bij de paarse cirkel.</p><div class="controls"><button class="button soft" data-action="listen-trace">🔊 Luister</button><button class="button primary" data-action="retry-trace" disabled>Opnieuw</button></div></section></main>${adBanner()}`;
  bindHeader();
  root.querySelector('[data-action="letters"]').addEventListener('click', () => { tracingSession = null; view = 'letters'; render(); });
  root.querySelector('[data-action="listen-trace"]').addEventListener('click', () => speak(drill.phoneme));
  root.querySelector('[data-action="retry-trace"]').addEventListener('click', () => tracingSession.formIndex === 0 ? startTracing(drill.id, 1) : startTracing(drill.id, 0));
  setupTracing();
  setTimeout(() => speak(drill.phoneme), 250);
}

function setupTracing() {
  const svg = root.querySelector('#trace-svg'); const shadows = [...svg.querySelectorAll('.trace-shadow')]; const progresses = [...svg.querySelectorAll('[data-trace-progress]')]; const dot = svg.querySelector('#trace-dot'); const start = svg.querySelector('#trace-start'); const end = svg.querySelector('#trace-end');
  const place = (node, point) => { node.setAttribute('cx', point.x); node.setAttribute('cy', point.y); };
  const activateStroke = () => {
    const shadow = shadows[tracingSession.strokeIndex]; const progress = progresses[tracingSession.strokeIndex]; const length = shadow.getTotalLength(); const samples = Array.from({ length: 181 }, (_, index) => shadow.getPointAtLength(length * index / 180));
    tracingSession.samples = samples; tracingSession.length = length; tracingSession.furthest = 0; tracingSession.acceptedMoves = 0; shadows.forEach((node, index) => node.classList.toggle('active-stroke', index === tracingSession.strokeIndex)); progresses.forEach((node, index) => { const segmentLength = shadows[index].getTotalLength(); node.style.strokeDasharray = `${segmentLength} ${segmentLength}`; node.style.strokeDashoffset = String(index < tracingSession.strokeIndex ? 0 : segmentLength); }); place(dot, samples[0]); place(start, samples[0]); place(end, samples[samples.length - 1]); progress.style.strokeDasharray = `${length} ${length}`; progress.style.strokeDashoffset = String(length);
  };
  activateStroke();
  const nearestPoint = event => { const bounds = svg.getBoundingClientRect(); const x = (event.clientX - bounds.left) * svg.viewBox.baseVal.width / bounds.width; const y = (event.clientY - bounds.top) * svg.viewBox.baseVal.height / bounds.height; let nearest = 0; let distance = Infinity; tracingSession.samples.forEach((point, index) => { const candidate = (point.x - x) ** 2 + (point.y - y) ** 2; if (candidate < distance) { distance = candidate; nearest = index; } }); return nearest; };
  const update = index => { const maximumStep = 12; if (index > tracingSession.furthest + maximumStep) return; const progress = progresses[tracingSession.strokeIndex]; if (index > tracingSession.furthest) tracingSession.acceptedMoves = (tracingSession.acceptedMoves || 0) + 1; tracingSession.furthest = Math.max(tracingSession.furthest, index); place(dot, tracingSession.samples[index]); progress.style.strokeDashoffset = String(tracingSession.length * (1 - tracingSession.furthest / (tracingSession.samples.length - 1))); if (!tracingSession.completed && tracingSession.acceptedMoves >= 14 && tracingSession.furthest >= tracingSession.samples.length - 8) { if (tracingSession.strokeIndex < shadows.length - 1) { tracingSession.strokeIndex += 1; root.querySelector('#trace-feedback').textContent = 'Goed zo! Volg nu de volgende lijn.'; activateStroke(); } else finishTracing(); } };
  const startDrag = event => { event.preventDefault(); tracingSession.dragging = true; svg.setPointerCapture?.(event.pointerId); };
  const move = event => { if (tracingSession.dragging) update(nearestPoint(event)); };
  const stop = () => { tracingSession.dragging = false; };
  dot.addEventListener('pointerdown', startDrag); svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', stop); svg.addEventListener('pointercancel', stop);
}

async function finishTracing() {
  tracingSession.completed = true;
  const language = pack(); const progress = languageProgress(profile, language.metadata.id); const tracingCompleted = [...new Set([...(progress.tracingCompleted || []), tracingSession.form.id])]; updateLanguageProgress(profile, language.metadata.id, { tracingCompleted }); rewardPractice(profile); await persistTracingProgress(tracingSession.form.id); const feedback = root.querySelector('#trace-feedback'); feedback.className = 'feedback success celebrate'; feedback.textContent = tracingSession.formIndex === 0 ? `Goed gedaan! Nu de kleine ${tracingSession.drill.lowercase}.` : `Goed gedaan! Je hebt de ${tracingSession.drill.letter} en ${tracingSession.drill.lowercase} geoefend. ⭐`; const next = root.querySelector('[data-action="retry-trace"]'); next.disabled = false; next.textContent = tracingSession.formIndex === 0 ? 'Kleine letter →' : 'Opnieuw'; speak(ui().great);
}

function renderHome() {
  const language = pack(); const progress = languageProgress(profile, language.metadata.id); const completed = progress.completed.length;
  root.innerHTML = `${header()}<main class="screen"><section class="home-grid"><div class="welcome"><div class="eyebrow" style="color:#e9e5ff">${language.metadata.flag} ${language.metadata.nativeName}</div><h1>${ui().hello}</h1><p>${ui().dailyIntro}</p><button class="daily" data-action="daily">▶ ${ui().daily}</button></div><aside class="reward"><div class="eyebrow">${ui().growth}</div><div class="stars">${'⭐'.repeat(Math.min(3, Math.max(1, profile.rewards.stars || 1)))}</div><strong>${completed} / ${language.curriculum.length} ${ui().worlds}</strong><div class="progress"><span style="width:${completed / language.curriculum.length * 100}%"></span></div></aside></section><div class="level-heading"><button class="back" data-action="games">← Spellen</button><div><div class="eyebrow">Woordbouwers</div><h2>Kies een niveau</h2></div></div><section class="lesson-list" aria-label="${ui().worlds}">${language.curriculum.map((lesson, index) => { const locked = index > completed; return `<button class="lesson" data-lesson="${index}" ${locked ? 'disabled aria-disabled="true"' : ''}><span class="lesson-icon">${locked ? '🔒' : lesson.icon}</span><span><strong>${lesson.title}</strong><small>${lesson.skill === 'letter' ? ui().sounds : ui().building}</small></span><span class="lesson-progress">${progress.completed.includes(index) ? '✓' : `${Math.min(10, progress.activeLesson === index ? progress.wordIndex || 0 : 0)}/10`}</span></button>`; }).join('')}</section></main>${adBanner()}`;
  root.querySelector('[data-action="daily"]').addEventListener('click', () => startLesson(progress.activeLesson || 0));
  root.querySelector('[data-action="games"]').addEventListener('click', () => { view = 'games'; render(); });
  root.querySelectorAll('[data-lesson]').forEach(button => button.addEventListener('click', () => startLesson(Number(button.dataset.lesson))));
  bindHeader();
}

function adBanner() { const text = pack() ? ui() : baseUi(); return profile.preferences.adsEnabled ? `<aside class="ad-banner" aria-label="${text.ad}"><span>${text.ad}</span> ${text.adMessage}</aside>` : ''; }

function startLesson(index) {
  const language = pack(); const progress = languageProgress(profile, language.metadata.id); const lesson = language.curriculum[index];
  const wordIndex = progress.activeLesson === index ? (progress.wordIndex || 0) : 0;
  session = { lessonIndex: index, wordIndex: Math.min(wordIndex, lesson.words.length - 1), picks: [], pickButtons: [], mistakes: 0, hintUsed: false, solved: false };
  view = 'game'; render();
}

function renderGame() {
  const language = pack(); const lesson = language.curriculum[session.lessonIndex]; const item = lesson.words[session.wordIndex]; const letters = shuffle([...item.word, ...shuffle(language.alphabet.filter(letter => !item.word.includes(letter))).slice(0, 3)]);
  root.innerHTML = `${header()}<main class="screen game"><div class="game-head"><button class="back" data-action="home">← ${ui().back}</button><div class="progress"><span style="width:${session.wordIndex / lesson.words.length * 100}%"></span></div><span class="count">${session.wordIndex + 1}/10</span></div><section class="game-card"><div class="eyebrow">${lesson.title}</div><div class="picture" role="img" aria-label="${item.word}">${item.emoji}</div><p class="instruction">${lesson.skill === 'letter' ? ui().find : ui().build}</p><div class="answer" id="answer">${'_ '.repeat(item.word.length)}</div><p class="feedback" id="feedback">${ui().gameIntro}</p><div class="letters" id="letters">${letters.map((letter, index) => `<button class="letter" data-letter="${letter}" data-index="${index}">${letter}</button>`).join('')}</div><div class="controls"><button class="button soft" data-action="listen">🔊 ${ui().listen}</button><button class="button soft" data-action="hint">💡 ${ui().hint}</button><button class="button soft" data-action="undo" disabled>⌫</button><button class="button primary" data-action="check" disabled>${ui().check}</button></div></section></main>${adBanner()}`;
  bindHeader();
  root.querySelector('[data-action="home"]').addEventListener('click', async () => { updateLanguageProgress(profile, language.metadata.id, { activeLesson: session.lessonIndex, wordIndex: session.wordIndex }); await persistCloudProgress(); view = 'home'; render(); });
  root.querySelector('[data-action="listen"]').addEventListener('click', () => speak(item.word));
  root.querySelector('[data-action="hint"]').addEventListener('click', event => useHint(item, event.currentTarget));
  root.querySelector('[data-action="undo"]').addEventListener('click', undoPick);
  root.querySelector('[data-action="check"]').addEventListener('click', () => check(item, lesson));
  root.querySelectorAll('[data-letter]').forEach(button => button.addEventListener('click', () => selectLetter(button, item)));
}

function selectLetter(button, item) { if (session.solved || button.classList.contains('selected') || session.picks.length >= item.word.length) return; const expected = item.word[session.picks.length]; if (button.dataset.letter !== expected) { button.classList.add('wrong'); speak(button.dataset.letter); setTimeout(() => button.classList.remove('wrong'), 650); return; } button.classList.add('selected', 'correct'); session.picks.push(button.dataset.letter); session.pickButtons.push(button); updateAnswer(item); }
function updateAnswer(item) { root.querySelector('#answer').textContent = session.picks.join(' ') + ' ' + '_ '.repeat(item.word.length - session.picks.length); root.querySelector('[data-action="undo"]').disabled = !session.picks.length; root.querySelector('[data-action="check"]').disabled = session.picks.length !== item.word.length; }
function undoPick() { const button = session.pickButtons.pop(); if (button) button.classList.remove('selected'); session.picks.pop(); const item = pack().curriculum[session.lessonIndex].words[session.wordIndex]; updateAnswer(item); }
function useHint(item, button) { if (session.hintUsed) return; const target = [...root.querySelectorAll('[data-letter]')].find(node => node.dataset.letter === item.word[session.picks.length] && !node.classList.contains('selected')); if (target) target.classList.add('hinted'); session.hintUsed = true; button.disabled = true; root.querySelector('#feedback').textContent = `${ui().listenPrompt} ${item.word[session.picks.length]}`; speak(item.word[session.picks.length]); }
async function check(item, lesson) { const feedback = root.querySelector('#feedback'); if (session.solved) return nextWord(lesson); if (session.picks.join('') === item.word) { session.solved = true; session.pickButtons.forEach(button => button.classList.add('correct')); feedback.className = 'feedback success celebrate'; feedback.textContent = `${ui().great} ⭐`; root.querySelector('[data-action="check"]').textContent = `✅ ${ui().next}`; root.querySelector('[data-action="undo"]').disabled = true; rewardPractice(profile); await persistCloudProgress(); speak(ui().great); } else { session.mistakes += 1; feedback.className = 'feedback error'; session.pickButtons.forEach(button => button.classList.add('wrong')); if (session.mistakes >= 3) { feedback.textContent = ui().restart; setTimeout(() => { session = null; view = 'home'; render(); }, 1100); } else { feedback.textContent = `${ui().tryAgain} (${3 - session.mistakes})`; setTimeout(() => session.pickButtons.forEach(button => button.classList.remove('wrong')), 650); session.picks = []; session.pickButtons.forEach(button => button.classList.remove('selected', 'correct')); session.pickButtons = []; updateAnswer(item); speak(item.word); } } }
async function nextWord(lesson) { const language = pack(); const progress = languageProgress(profile, language.metadata.id); if (session.wordIndex >= lesson.words.length - 1) { const completed = [...new Set([...progress.completed, session.lessonIndex])]; updateLanguageProgress(profile, language.metadata.id, { completed, activeLesson: Math.min(session.lessonIndex + 1, language.curriculum.length - 1), wordIndex: 0 }); await persistCloudProgress(); session = null; view = 'home'; render(); return; } session.wordIndex += 1; session.picks = []; session.pickButtons = []; session.solved = false; session.hintUsed = false; updateLanguageProgress(profile, language.metadata.id, { activeLesson: session.lessonIndex, wordIndex: session.wordIndex }); await persistCloudProgress(); render(); }

function renderParent() { const language = pack(); const homeLanguage = languageCatalog.find(item => item.id === profile.homeLanguage); const progress = languageProgress(profile, language.metadata.id); root.innerHTML = `${header()}<main class="screen parent"><button class="back" data-action="home">← ${ui().back}</button><div class="eyebrow">${ui().parents}</div><h1>${ui().parentTitle}</h1><div class="parent-grid"><div class="metric"><strong>${progress.completed.length}</strong><small>${ui().worldsDone}</small></div><div class="metric"><strong>${profile.rewards.streak}</strong><small>${ui().days}</small></div><div class="metric"><strong>${profile.rewards.stars}</strong><small>${ui().stars}</small></div></div><div class="switch-row"><span>${ui().homeLanguage}</span><button class="speaker" data-action="home-language">${homeLanguage.flag} ${homeLanguage.nativeName}</button></div><div class="switch-row"><span>${ui().adSetting}</span><label><input id="ads" type="checkbox" ${profile.preferences.adsEnabled ? 'checked' : ''}> ${ui().on}</label></div><p class="intro">${ui().savedNote}</p></main>${adBanner()}`; bindHeader(); root.querySelector('[data-action="home"]').addEventListener('click', () => { view = 'home'; render(); }); root.querySelector('[data-action="home-language"]').addEventListener('click', () => { languageTarget = 'native'; view = 'languages'; render(); }); root.querySelector('#ads').addEventListener('change', event => { profile.preferences.adsEnabled = event.target.checked; saveProfile(profile); render(); }); }
function bindHeader() { root.querySelector('[data-action="languages"]')?.addEventListener('click', () => { view = 'languages'; render(); }); root.querySelector('[data-action="parent"]')?.addEventListener('click', () => { view = 'parent'; render(); }); if (cloudUser) { const stats = root.querySelector('.stat-row'); if (stats && !stats.querySelector('[data-action="signout"]')) { const button = document.createElement('button'); button.className = 'chip signout'; button.dataset.action = 'signout'; button.textContent = 'Uitloggen'; stats.appendChild(button); } root.querySelector('[data-action="signout"]')?.addEventListener('click', async () => { await signOut(); cloudUser = null; profile.account = null; saveProfile(profile); authMode = 'choice'; view = 'auth'; render(); }); } }
function render() { if (view === 'auth') renderAuth(); else if (view === 'languages') renderLanguages(); else if (view === 'games') renderGames(); else if (view === 'letters') renderLetters(); else if (view === 'tracing') renderTracing(); else if (view === 'game') renderGame(); else if (view === 'parent') renderParent(); else renderHome(); }
async function boot() { try { const sessionState = await currentSession(); cloudUser = sessionState?.user || null; if (cloudUser) { profile.account = { email: cloudUser.email, provider: 'supabase' }; await syncCloudProgress(); await syncTracingProgress(); view = profile.selectedLanguage ? (profile.selectedGame === 'letter-trail' ? 'letters' : profile.selectedGame ? 'home' : 'games') : 'languages'; } else { profile.account = null; saveProfile(profile); view = 'auth'; } } catch (error) { console.warn('Cloud session unavailable; offline mode remains available.', error); } if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(() => {}); render(); }
boot();
