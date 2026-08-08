import { languageCatalog, languagePackages } from './data/languages.js';
import { persianAudio } from './data/audio-fa.js';
import { writingPaths, writingConnections } from './data/writing-paths.js';
import { loadProfile, saveProfile, languageProgress, updateLanguageProgress, rewardPractice } from './modules/storage.js';
import { currentSession, signUp, signIn, signInWithGoogle, signOut, readProgress, writeProgress } from './modules/cloud.js';

const root = document.querySelector('#app');
let profile = loadProfile();
document.documentElement.dir = profile.appLanguage === 'fa' ? 'rtl' : 'ltr';
let view = profile.appLanguage ? (profile.account ? (profile.selectedLanguage ? 'home' : 'languages') : 'auth') : 'app-language';
let session = null;
let languageTarget = 'learning';
let authMode = 'choice';
let cloudUser = null;
let tracingSession = null;
const TRACE_LEVEL_OFFSET = 100;
const RELEASE = '0.6.76';

const escape = value => String(value).replace(/[&<>"]/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[char]));
const shuffle = values => [...values].sort(() => Math.random() - .5);
const pack = () => languagePackages[profile.learningLanguage || profile.selectedLanguage];
const ui = () => languagePackages[profile.appLanguage || 'nl'].ui;
const baseUi = ui;
const appCopy = {
  nl: { welcome:'Welkom!', beginJourney:'Begin jouw leeravontuur.', playGuest:'Speel als gast', beginNow:'Begin meteen met oefenen', createAccount:'Maak een account', saveProgress:'Bewaar jouw voortgang', haveAccount:'Al een account?', logIn:'Log in', welcomeBack:'Welkom terug', continueJourney:'Ga verder met jouw leerreis.', saveHero:'Bewaar de groei van je leerheld voor later.', email:'E-mailadres', password:'Wachtwoord', login:'Inloggen', signup:'Account maken', checkEmail:'Controleer je e-mail en bevestig je account. Daarna kun je inloggen.', childName:'Hoe heet jij?', changeName:'Naam wijzigen', childNameHelp:'We gebruiken jouw naam om een speciale schrijfoefening voor jou te maken.', firstName:'Jouw voornaam', exampleName:'Bijvoorbeeld: Noor', continue:'Verder', child:'Kind', changeChildName:'Naam van kind wijzigen', parents:'Ouders', signOut:'Uitloggen', chooseGame:'Kies een spel', gameIntro:'Kies hoe je vandaag wilt oefenen.', games:'Spellen', chooseLetter:'Kies een letter', bothCases:'Oefen telkens de hoofdletter én de kleine letter.', lettersPractised:'letters geoefend', myName:'Mijn naam schrijven', readyAgain:'Klaar — nog eens oefenen?', practise:'Oefen', letters:'Letters', letterTrail:'Letterspoor', followLetter:'Volg de letter', traceIntro:'Luister naar de klank. Houd de cirkel vast en volg het grijze spoor.', startPurple:'Luister en begin bij de paarse cirkel.', listen:'Luister', retry:'Opnieuw', write:'Schrijf', nameTrail:'Letterspoor · jouw naam', nameIntro:'Een naam bestaat uit losse letters. Volg ze van links naar rechts.', nameStart:'Begin bij de paarse cirkel en volg jouw hele naam.', nextLine:'Goed zo! Volg nu de volgende lijn.', lowercaseNext:'Goed gedaan! Nu de kleine', letterDone:'Goed gedaan! Je hebt de', nameDone:'Fantastisch, {name}! Jij hebt jouw hele naam geschreven.', wordBuilders:'Woordbouwers', chooseLevel:'Kies een niveau' },
  en: { welcome:'Welcome!', beginJourney:'Start your learning adventure.', playGuest:'Play as guest', beginNow:'Start practising right away', createAccount:'Create an account', saveProgress:'Save your progress', haveAccount:'Already have an account?', logIn:'Log in', welcomeBack:'Welcome back', continueJourney:'Continue your learning journey.', saveHero:'Save your little learner’s progress for later.', email:'Email address', password:'Password', login:'Log in', signup:'Create account', checkEmail:'Check your email and confirm your account. Then you can log in.', childName:'What is your name?', changeName:'Change name', childNameHelp:'We use your name to create a special writing activity just for you.', firstName:'Your first name', exampleName:'For example: Sam', continue:'Continue', child:'Child', changeChildName:'Change child name', parents:'Parents', signOut:'Sign out', chooseGame:'Choose a game', gameIntro:'Choose how you would like to practise today.', games:'Games', chooseLetter:'Choose a letter', bothCases:'Practise the capital and lowercase letter each time.', lettersPractised:'letters practised', myName:'Write my name', readyAgain:'Done — practise again?', practise:'Practise', letters:'Letters', letterTrail:'Letter trail', followLetter:'Trace the letter', traceIntro:'Listen to the sound. Hold the circle and follow the grey path.', startPurple:'Listen and start at the purple circle.', listen:'Listen', retry:'Try again', write:'Write', nameTrail:'Letter trail · your name', nameIntro:'A name is made of letters. Follow them from left to right.', nameStart:'Start at the purple circle and follow your whole name.', nextLine:'Nice! Now follow the next line.', lowercaseNext:'Great job! Now the lowercase', letterDone:'Great job! You practised the', nameDone:'Fantastic, {name}! You wrote your whole name.', wordBuilders:'Word builders', chooseLevel:'Choose a level' }
};
appCopy.fa = { welcome:'خوش آمدی!', beginJourney:'ماجراجویی یادگیری خودت را شروع کن.', playGuest:'بازی به‌عنوان مهمان', beginNow:'همین حالا تمرین را شروع کن', createAccount:'ساخت حساب', saveProgress:'پیشرفت خودت را ذخیره کن', haveAccount:'حساب داری؟', logIn:'ورود', welcomeBack:'خوش برگشتی', continueJourney:'سفر یادگیری‌ات را ادامه بده.', saveHero:'پیشرفت کودک را برای بعد ذخیره کن.', email:'ایمیل', password:'رمز عبور', login:'ورود', signup:'ساخت حساب', checkEmail:'ایمیل خود را بررسی و حسابت را تأیید کن. سپس وارد شو.', childName:'نام تو چیست؟', changeName:'تغییر نام', childNameHelp:'از نام تو برای ساخت یک تمرین نوشتن ویژه استفاده می‌کنیم.', firstName:'نام کوچک تو', exampleName:'مثلاً: علی', continue:'ادامه', child:'کودک', changeChildName:'تغییر نام کودک', parents:'برای والدین', signOut:'خروج', chooseGame:'یک بازی انتخاب کن', gameIntro:'انتخاب کن امروز چطور تمرین کنی.', games:'بازی‌ها', chooseLetter:'یک حرف انتخاب کن', bothCases:'هر بار حرف بزرگ و کوچک را تمرین کن.', lettersPractised:'حرف تمرین شده', myName:'نوشتن نام من', readyAgain:'تمام شد — دوباره تمرین کن', practise:'تمرین', letters:'حروف', letterTrail:'مسیر حرف', followLetter:'حرف را دنبال کن', traceIntro:'به صدا گوش کن. دایره را نگه دار و مسیر خاکستری را دنبال کن.', startPurple:'گوش کن و از دایره بنفش شروع کن.', listen:'گوش کن', retry:'دوباره', write:'بنویس', nameTrail:'مسیر حرف · نام تو', nameIntro:'هر نام از چند حرف ساخته شده است. از راست به چپ آن‌ها را دنبال کن.', nameStart:'از دایره بنفش شروع کن و نام کاملت را دنبال کن.', nextLine:'آفرین! حالا خط بعدی را دنبال کن.', lowercaseNext:'آفرین! حالا حرف کوچک', letterDone:'آفرین! این حروف را تمرین کردی:', nameDone:'آفرین {name}! تو نام کاملت را نوشتی.', wordBuilders:'واژه‌ساز', chooseLevel:'یک سطح انتخاب کن' };
const copy = () => appCopy[profile.appLanguage || 'nl'];
const languageFlags = language => `<span class="flag-set" aria-label="${escape(language.name)}">${(language.flagCodes || []).map(code => `<span class="country-flag flag-${code}" aria-hidden="true"></span>`).join('')}</span>`;
const games = () => pack()?.games || [];
const mascotAssets = {
  welcome: './assets/mascot/lumio-welcome.webp',
  learning: './assets/mascot/lumio-learning.webp',
  celebration: './assets/mascot/lumio-celebration.webp'
};
const mascotImage = (variant, className = '') => `<img class="mascot-art ${className}" src="${mascotAssets[variant]}" alt="" aria-hidden="true">`;

function decorateWithMascot() {
  const placements = {
    'app-language': ['.app-language-card', 'welcome', 'mascot-banner'],
    auth: [authMode === 'choice' ? '.auth-choice' : '.auth-form-card', 'welcome', 'mascot-banner'],
    'child-name': ['.child-name-card', 'learning', 'mascot-banner'],
    'native-name': ['.child-name-card', 'learning', 'mascot-banner'],
    languages: ['.hero', 'welcome', 'mascot-corner'],
    games: ['.game-picker', 'learning', 'mascot-corner'],
    letters: ['.letter-picker', 'learning', 'mascot-corner'],
    home: ['.welcome', 'welcome', 'mascot-corner']
  };
  const placement = placements[view]; if (!placement) return;
  const [selector, variant, className] = placement; const target = root.querySelector(selector);
  if (target && !target.querySelector('.mascot-art')) { target.classList.add('mascot-host'); target.insertAdjacentHTML('afterbegin', `<div class="${className}">${mascotImage(variant)}</div>`); }
}

function showMascotCelebration() {
  root.querySelector('.mascot-celebration-pop')?.remove();
  root.insertAdjacentHTML('beforeend', `<div class="mascot-celebration-pop" aria-hidden="true">${mascotImage('celebration')}</div>`);
  setTimeout(() => root.querySelector('.mascot-celebration-pop')?.remove(), 1150);
}

let activeAudio = null;
let audioPlaybackToken = 0;
function speakWithSystemVoice(text, locale) {
  if (!('speechSynthesis' in window)) return;
  speechSynthesis.cancel();
  const say = () => {
    const voices = speechSynthesis.getVoices();
    const languageCode = locale?.split('-')[0]?.toLowerCase();
    const voice = voices.find(item => item.lang.toLowerCase().startsWith(languageCode))
      || voices.find(item => item.name.toLowerCase().includes(languageCode === 'fa' ? 'persian' : languageCode));
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = voice?.lang || locale || document.documentElement.lang;
    utterance.rate = .78;
    if (voice) utterance.voice = voice;
    speechSynthesis.resume();
    speechSynthesis.speak(utterance);
  };
  if (speechSynthesis.getVoices().length) say();
  else {
    speechSynthesis.addEventListener('voiceschanged', say, { once: true });
    setTimeout(() => { if (speechSynthesis.getVoices().length) say(); }, 350);
  }
}

function speak(text, locale = pack()?.metadata.locale) {
  const spokenText = String(text || '').trim();
  const languageCode = locale?.split('-')[0]?.toLowerCase();
  const normalizedPersian = spokenText.replace(/ي/g, 'ی').replace(/ك/g, 'ک');
  const packagedSource = languageCode === 'fa' ? (persianAudio[spokenText] || persianAudio[normalizedPersian]) : null;
  const spelledSources = languageCode === 'fa' && !packagedSource
    ? [...normalizedPersian].filter(char => !/[\s\u200c\u200d]/.test(char)).map(char => persianAudio[char])
    : [];
  const canSpell = spelledSources.length && spelledSources.every(Boolean);
  const playbackToken = ++audioPlaybackToken;
  activeAudio?.pause();
  activeAudio = null;
  if ('speechSynthesis' in window) speechSynthesis.cancel();
  const sources = packagedSource ? [packagedSource] : (canSpell ? spelledSources : []);
  if (!sources.length) { speakWithSystemVoice(spokenText, locale); return; }
  let sourceIndex = 0;
  const playNext = () => {
    if (playbackToken !== audioPlaybackToken || sourceIndex >= sources.length) return;
    activeAudio = new Audio(sources[sourceIndex++]);
    activeAudio.preload = 'auto';
    activeAudio.addEventListener('ended', playNext, { once: true });
    activeAudio.play().catch(() => speakWithSystemVoice(spokenText, locale));
  };
  playNext();
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
    root.querySelector('[data-action="guest"]').addEventListener('click', () => { cloudUser = null; profile.account = null; saveProfile(profile); view = 'child-name'; render(); });
    return;
  }
  root.innerHTML = `<main class="screen account-screen"><section class="hero auth-form-card"><button class="back-auth" data-action="back-auth" aria-label="Terug">←</button><div class="eyebrow">Lumio</div><h1>${login ? 'Welkom terug' : 'Maak een account'}</h1><p>${login ? 'Ga verder met jouw leerreis.' : 'Bewaar de groei van je leerheld voor later.'}</p><form id="auth-form" class="auth-form"><label>E-mailadres<input id="auth-email" type="email" autocomplete="email" required placeholder="jij@voorbeeld.nl"></label><label>Wachtwoord<input id="auth-password" type="password" minlength="4" required placeholder="minimaal 4 tekens"></label><button class="button primary" type="submit">${login ? 'Inloggen' : 'Account maken'}</button></form><p class="auth-message" id="auth-message"></p><button class="login-link" data-action="auth-mode">${login ? 'Nog geen account? Maak er een' : 'Al een account? Log in'}</button></section></main>`;
  root.querySelector('#auth-form').addEventListener('submit', async event => { event.preventDefault(); const email = root.querySelector('#auth-email').value.trim().toLowerCase(); const password = root.querySelector('#auth-password').value; const message = root.querySelector('#auth-message'); message.textContent = login ? 'Inloggen…' : 'Account maken…'; const result = login ? await signIn(email, password) : await signUp(email, password); if (result.error) { message.textContent = result.error.message; return; } if (!result.data.session) { message.textContent = 'Controleer je e-mail en bevestig je account. Daarna kun je inloggen.'; return; } cloudUser = result.data.user; profile.account = { email, provider: 'supabase' }; saveProfile(profile); await syncCloudProgress(); await syncTracingProgress(); view = profile.childName ? (profile.selectedLanguage ? (profile.selectedGame === 'letter-trail' ? 'letters' : profile.selectedGame ? 'home' : 'games') : 'languages') : 'child-name'; render(); });
  root.querySelector('[data-action="auth-mode"]').addEventListener('click', () => { authMode = login ? 'signup' : 'login'; render(); });
  root.querySelector('[data-action="back-auth"]').addEventListener('click', () => { authMode = 'choice'; render(); });
}

function renderChildName() {
  const existing = escape(profile.childName || '');
  root.innerHTML = `<main class="screen account-screen"><section class="hero child-name-card"><div class="eyebrow">Lumio</div><div class="name-orb" aria-hidden="true">✏️</div><h1>${profile.childName ? 'Naam wijzigen' : 'Hoe heet jij?'}</h1><p>We gebruiken jouw naam om een speciale schrijfoefening voor jou te maken.</p><form id="child-name-form" class="auth-form"><label>Jouw voornaam<input id="child-name" type="text" autocomplete="given-name" maxlength="24" required placeholder="Bijvoorbeeld: Noor" value="${existing}"></label><button class="button primary" type="submit">Verder</button></form></section></main>`;
  root.querySelector('#child-name-form').addEventListener('submit', event => {
    event.preventDefault();
    const name = root.querySelector('#child-name').value.trim().replace(/\s+/g, ' ');
    if (!name) return;
    const changed = profile.childName !== name; profile.childName = name; if (changed && pack()) updateLanguageProgress(profile, pack().metadata.id, { namePracticeCompleted: false }); saveProfile(profile);
    view = profile.selectedLanguage ? (profile.selectedGame === 'letter-trail' ? 'letters' : profile.selectedGame ? 'home' : 'games') : 'languages';
    render();
  });
}

function renderAppLanguage() {
  const choices = languageCatalog.filter(language => ['nl', 'en', 'fa'].includes(language.id));
  root.innerHTML = `<main class="screen account-screen"><section class="hero app-language-card"><div class="eyebrow">Lumio</div><h1>Choose app language</h1><p>Kies de taal voor knoppen en uitleg.</p><div class="app-language-options">${choices.map(language => `<button class="choice-button account-choice" data-app-language="${language.id}">${languageFlags(language)}<span><strong>${language.nativeName}</strong><small>${language.id === 'nl' ? 'Nederlands' : 'English'}</small></span></button>`).join('')}</div></section></main>`;
  root.querySelectorAll('[data-app-language]').forEach(button => button.addEventListener('click', () => { profile.appLanguage = button.dataset.appLanguage; saveProfile(profile); view = 'auth'; render(); }));
}

function header() { return `<header class="topbar"><button class="brand" data-action="languages" aria-label="Lumio">Lu<span>mio</span></button><div class="stat-row"><button class="chip child-account" data-action="child-name" aria-label="Naam van kind wijzigen">👤 <span>${escape(profile.childName || 'Kind')}</span></button><button class="chip" data-action="parent" aria-label="Ouders">👨‍👩‍👧</button><span class="chip">🔥 ${profile.rewards.streak || 0}</span><span class="chip">⭐ ${profile.rewards.stars || 0}</span></div></header>`; }

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
  if (profile.childName) {
    root.querySelector('.letter-picker-grid').insertAdjacentHTML('afterend', `<button class="name-letter-choice ${progress.namePracticeCompleted ? 'done' : ''}" data-action="my-name"><span aria-hidden="true">✍️</span><span><strong>Mijn naam schrijven</strong><small>${progress.namePracticeCompleted ? 'Klaar — nog eens oefenen?' : `Oefen ${escape(profile.childName)}`}</small></span><b aria-hidden="true">${progress.namePracticeCompleted ? '✓' : '→'}</b></button>`);
    root.querySelector('[data-action="my-name"]').addEventListener('click', startNameTracing);
  }
  bindHeader();
}

function nameCharacters(language = pack()) {
  const value = nameForLanguage(language) || '';
  if (language.writingRules?.script === 'arabic') return Array.from(value.replace(/ي/g, 'ی').replace(/ك/g, 'ک')).filter(char => char === ' ' || language.writing.some(drill => drill.letter === char || drill.forms.some(form => form.glyph === char)));
  return Array.from(value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase()).filter(char => /^[a-z]$/.test(char));
}
function persianNamePath(language, letters, letter, index) {
  const drill = language.writing.find(item => item.letter === letter || item.forms.some(form => form.glyph === letter)); if (!drill) return null;
  const joinsFromRight = index > 0 && letters[index - 1] !== ' ' && !nonJoiningPersianLetters.has(letters[index - 1]);
  const joinsToLeft = index < letters.length - 1 && letters[index + 1] !== ' ' && !nonJoiningPersianLetters.has(letter);
  const formBy = pattern => drill.forms.find(form => pattern.test(form.id));
  const medialForm = () => formBy(/-medial$/) || formBy(/-middle$/);
  const isolatedEnd = () => formBy(/-isolated$/) || formBy(/-final$/) || drill.forms.find(form => form.id.endsWith('-end') && !form.id.endsWith('-connected-end'));
  let form;
  if (drill.id === 'letter-alef') form = letter === 'آ' ? formBy(/initial/) : formBy(/isolated/);
  else if (drill.forms.length === 1) form = drill.forms[0];
  else if (joinsFromRight && joinsToLeft) form = medialForm() || formBy(/initial|begin/);
  else if (!joinsFromRight && joinsToLeft) form = formBy(/initial|begin/) || medialForm();
  else if (joinsFromRight) form = formBy(/connected-end/) || isolatedEnd() || drill.forms[drill.forms.length - 1];
  else form = isolatedEnd() || drill.forms[drill.forms.length - 1];
  if (!form || !writingPaths[form.pathId]) return null;
  return { path: writingPaths[form.pathId], pathId: form.pathId, joinsFromRight, joinsToLeft, connection: writingConnections[form.pathId] || {} };
}
function startNameTracing() {
  const language = pack();
  if (needsLocalizedName(language) && !profile.localizedNames?.[language.metadata.id]) { view = 'native-name'; render(); return; }
  const nameValue = nameForLanguage(language); const letters = nameCharacters(language); if (!letters.length) return;
  const persian = language.writingRules?.script === 'arabic';
  const entries = letters.map((letter, index) => {
    if (letter === ' ') return null;
    if (!persian) return { letter, path: writingPaths[`${index === 0 ? 'capital' : 'lowercase'}-${letter}`] };
    const contextual = persianNamePath(language, letters, letter, index);
    return contextual ? { letter, wordBreakBefore: index > 0 && letters[index - 1] === ' ', ...contextual } : null;
  }).filter(entry => entry?.path);
  if (!entries.length) return;
  const nameLetters = entries.map(entry => entry.letter); const namePaths = entries.map(entry => entry.path);
  const drill = { id: 'my-name', letter: nameValue, lowercase: nameValue, phoneme: nameValue, title: copy().myName };
  tracingSession = { drill, form: { id: 'my-name', label: copy().myName }, formIndex: 0, path: namePaths[0], namePaths, nameEntries: entries, dragging: false, completed: false, strokeIndex: 0, furthest: 0, namePractice: true, nameLetters, nameValue, nameDirection: language.writingRules?.direction || 'ltr' };
  view = 'tracing'; render();
}

function startTracing(drillId, formIndex = 0) {
  const drill = pack().writing?.find(item => item.id === drillId) || pack().writing?.[0];
  const form = drill?.forms?.[formIndex]; if (!drill || !form || !writingPaths[form.pathId]) { view = 'games'; render(); return; }
  tracingSession = { drill, form, formIndex, path: writingPaths[form.pathId], dragging: false, completed: false, strokeIndex: 0, furthest: 0 };
  view = 'tracing'; render();
}

function renderTracing() {
  if (tracingSession.namePractice) { renderNameTracing(); return; }
  const { drill, path, form } = tracingSession; const t = copy(); const traceGlyph = form.glyph || drill.letter; const tracePhoneme = form.phoneme || drill.phoneme;
  root.innerHTML = `${header()}<main class="screen tracing-screen"><div class="game-head"><button class="back" data-action="letters">← ${t.letters}</button><span class="count">${drill.title}</span></div><section class="tracing-card"><div class="eyebrow">${t.letterTrail}</div><h1>${t.followLetter} ${traceGlyph}</h1><p>${t.traceIntro}</p><div class="trace-stage"><svg id="trace-svg" viewBox="${path.viewBox}" role="img" aria-label="${t.followLetter} ${traceGlyph}: ${form.label}">${path.strokes.map((stroke, index) => `<path class="trace-shadow" d="${stroke}"/><path class="trace-progress" data-trace-progress="${index}" d="${stroke}"/>`).join('')}<circle id="trace-start" class="trace-marker start" r="13"/><circle id="trace-end" class="trace-marker end" r="13"/><circle id="trace-dot" class="trace-dot" r="17" tabindex="0" role="button" aria-label="${t.followLetter} ${traceGlyph}"/></svg></div><p id="trace-feedback" class="feedback">${t.startPurple}</p><div class="controls"><button class="button soft" data-action="listen-trace">🔊 ${t.listen}</button><button class="button primary" data-action="retry-trace" disabled>${t.retry}</button></div></section></main>${adBanner()}`;
  bindHeader();
  root.querySelector('.tracing-card h1').insertAdjacentHTML('afterend', `<div style="display:inline-block;margin:0 0 10px;padding:6px 12px;border-radius:999px;background:var(--purple);color:var(--violet);font-size:.88rem;font-weight:900">${tracingSession.form.label}</div>`);
  root.querySelector('[data-action="letters"]').addEventListener('click', () => { tracingSession = null; view = 'letters'; render(); });
  root.querySelector('[data-action="listen-trace"]').addEventListener('click', () => speak(tracePhoneme));
  root.querySelector('[data-action="retry-trace"]').addEventListener('click', () => startTracing(drill.id, tracingSession.formIndex));
  setupTracing();
  speak(tracePhoneme);
}

function renderNameTracing() {
  const { namePaths, nameEntries, nameLetters, nameValue, nameDirection } = tracingSession; const t = copy(); const rtl = nameDirection === 'rtl';
  let placements;
  if (rtl) {
    const baseline = 330; const disconnectedAdvance = 245; const wordGap = 120;
    placements = [];
    nameEntries.forEach((entry, index) => {
      const incoming = entry.connection?.incoming || { x: 280, y: 270 };
      if (!index) { placements.push({ x: 0, y: baseline - incoming.y }); return; }
      const previous = nameEntries[index - 1]; const previousPlacement = placements[index - 1];
      const outgoing = previous.connection?.outgoing;
      const connects = previous.joinsToLeft && entry.joinsFromRight && outgoing && incoming;
      placements.push(connects
        ? { x: previousPlacement.x + outgoing.x - incoming.x, y: previousPlacement.y + outgoing.y - incoming.y }
        : { x: previousPlacement.x - disconnectedAdvance - (entry.wordBreakBefore ? wordGap : 0), y: baseline - incoming.y });
    });
    const minimumX = Math.min(...placements.map(point => point.x));
    placements = placements.map(point => ({ x: point.x - minimumX + 25, y: point.y }));
  } else placements = namePaths.map((_, index) => ({ x: 25 + index * 280, y: 0 }));
  const width = Math.max(360, Math.max(...placements.map(point => point.x + 360)) + 25);
  const letterMap = nameLetters.map((letter, index) => `${nameEntries[index]?.wordBreakBefore ? '<span class="name-progress-gap" aria-hidden="true"></span>' : ''}<span class="name-progress-letter" data-name-letter="${index}">${rtl ? letter : (index === 0 ? letter.toUpperCase() : letter)}</span>`).join('');
  const strokes = namePaths.map((path, letterIndex) => { const offset = placements[letterIndex]; return path.strokes.map((stroke, strokeIndex) => `<g transform="translate(${offset.x},${offset.y})"><path class="trace-shadow" data-offset-x="${offset.x}" data-offset-y="${offset.y}" d="${stroke}"/><path class="trace-progress" data-trace-progress="${letterIndex}-${strokeIndex}" data-offset-x="${offset.x}" data-offset-y="${offset.y}" d="${stroke}"/></g>`).join(''); }).join('');
  root.innerHTML = `${header()}<main class="screen tracing-screen"><div class="game-head"><button class="back" data-action="letters">← ${t.letters}</button><span class="count">${t.myName}</span></div><section class="tracing-card"><div class="eyebrow">${t.nameTrail}</div><h1>${t.write}: <span dir="${nameDirection}">${escape(nameValue)}</span></h1><p>${t.nameIntro}</p><div class="name-progress" dir="${nameDirection}" aria-label="${escape(nameValue)}">${letterMap}</div><div class="trace-stage name-stage"><svg id="trace-svg" class="name-svg" style="width:${width}px" viewBox="0 0 ${width} 500" role="img" aria-label="${t.write} ${escape(nameValue)}">${strokes}<circle id="trace-start" class="trace-marker start" r="13"/><circle id="trace-end" class="trace-marker end" r="13"/><circle id="trace-dot" class="trace-dot" r="17" tabindex="0" role="button" aria-label="${t.nameStart}"/></svg></div><p id="trace-feedback" class="feedback">${t.nameStart}</p><div class="controls"><button class="button soft" data-action="listen-trace">🔊 ${t.listen}</button><button class="button primary" data-action="retry-trace">${t.retry}</button></div></section></main>${adBanner()}`;
  bindHeader();
  root.querySelector('[data-action="letters"]').addEventListener('click', () => { tracingSession = null; view = 'letters'; render(); });
  root.querySelector('[data-action="listen-trace"]').addEventListener('click', () => speak(nameValue));
  root.querySelector('[data-action="retry-trace"]').addEventListener('click', startNameTracing);
  setupTracing(); speak(nameValue);
}

function setupTracing() {
  const svg = root.querySelector('#trace-svg'); const shadows = [...svg.querySelectorAll('.trace-shadow')]; const progresses = [...svg.querySelectorAll('[data-trace-progress]')]; const dot = svg.querySelector('#trace-dot'); const start = svg.querySelector('#trace-start'); const end = svg.querySelector('#trace-end');
  const place = (node, point) => { node.setAttribute('cx', point.x); node.setAttribute('cy', point.y); };
  const activateStroke = () => {
    // Every fragment requires a fresh press. Without this reset, the pointer
    // gesture that finished one stroke can also complete the next short one.
    tracingSession.dragging = false;
    const shadow = shadows[tracingSession.strokeIndex]; const progress = progresses[tracingSession.strokeIndex]; const length = shadow.getTotalLength(); const offsetX = Number(shadow.dataset.offsetX || 0); const offsetY = Number(shadow.dataset.offsetY || 0); const samples = Array.from({ length: 181 }, (_, index) => { const point = shadow.getPointAtLength(length * index / 180); return { x: point.x + offsetX, y: point.y + offsetY }; });
    const firstSample = samples[0]; const lastSample = samples[samples.length - 1]; const directLength = Math.hypot(lastSample.x - firstSample.x, lastSample.y - firstSample.y); tracingSession.easyStraightStroke = length >= 20 && length <= 70 && Math.abs(length - directLength) < 1; tracingSession.samples = samples; tracingSession.length = length; tracingSession.furthest = 0; tracingSession.acceptedMoves = 0; shadows.forEach((node, index) => node.classList.toggle('active-stroke', index === tracingSession.strokeIndex)); progresses.forEach((node, index) => { const segmentLength = shadows[index].getTotalLength(); node.style.strokeDasharray = `${segmentLength} ${segmentLength}`; node.style.strokeDashoffset = String(index < tracingSession.strokeIndex ? 0 : segmentLength); }); if (tracingSession.namePractice) { let cursor = 0; let activeLetter = 0; tracingSession.namePaths.forEach((glyph, letterIndex) => { if (tracingSession.strokeIndex >= cursor && tracingSession.strokeIndex < cursor + glyph.strokes.length) activeLetter = letterIndex; cursor += glyph.strokes.length; }); root.querySelectorAll('[data-name-letter]').forEach((node, letterIndex) => node.classList.toggle('done', letterIndex < activeLetter)); root.querySelector(`[data-name-letter="${activeLetter}"]`)?.classList.add('active'); } place(dot, samples[0]); place(start, samples[0]); place(end, samples[samples.length - 1]); progress.style.strokeDasharray = `${length} ${length}`; progress.style.strokeDashoffset = String(length);
  };
  activateStroke();
  const nearestPoint = event => { const bounds = svg.getBoundingClientRect(); const x = (event.clientX - bounds.left) * svg.viewBox.baseVal.width / bounds.width; const y = (event.clientY - bounds.top) * svg.viewBox.baseVal.height / bounds.height; let nearest = 0; let distance = Infinity; tracingSession.samples.forEach((point, index) => { const candidate = (point.x - x) ** 2 + (point.y - y) ** 2; if (candidate < distance) { distance = candidate; nearest = index; } }); return nearest; };
  const update = index => { const easyStraightStroke = tracingSession.easyStraightStroke; const maximumStep = easyStraightStroke ? tracingSession.samples.length : 12; const requiredMoves = easyStraightStroke ? 1 : 14; if (index > tracingSession.furthest + maximumStep) return; const progress = progresses[tracingSession.strokeIndex]; if (index > tracingSession.furthest) tracingSession.acceptedMoves = (tracingSession.acceptedMoves || 0) + 1; tracingSession.furthest = Math.max(tracingSession.furthest, index); place(dot, tracingSession.samples[index]); progress.style.strokeDashoffset = String(tracingSession.length * (1 - tracingSession.furthest / (tracingSession.samples.length - 1))); if (!tracingSession.completed && tracingSession.acceptedMoves >= requiredMoves && tracingSession.furthest >= tracingSession.samples.length - 8) { if (tracingSession.strokeIndex < shadows.length - 1) { tracingSession.strokeIndex += 1; root.querySelector('#trace-feedback').textContent = copy().nextLine; activateStroke(); } else finishTracing(); } };
  const startDrag = event => { event.preventDefault(); tracingSession.dragging = true; svg.setPointerCapture?.(event.pointerId); if (tracingSession.length < 20 && !tracingSession.completed) { const last = tracingSession.samples.length - 1; tracingSession.furthest = last - 12; tracingSession.acceptedMoves = 14; update(last); } };
  const move = event => { if (tracingSession.dragging) update(nearestPoint(event)); };
  const stop = () => { tracingSession.dragging = false; };
  dot.addEventListener('pointerdown', startDrag); svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', stop); svg.addEventListener('pointercancel', stop);
}

async function finishTracing() {
  if (tracingSession.namePractice) return finishNameTracing();
  tracingSession.completed = true;
  const nextIndex = tracingSession.formIndex + 1; const hasNext = nextIndex < tracingSession.drill.forms.length;
  const language = pack(); const progress = languageProgress(profile, language.metadata.id); const tracingCompleted = [...new Set([...(progress.tracingCompleted || []), tracingSession.form.id])]; updateLanguageProgress(profile, language.metadata.id, { tracingCompleted }); rewardPractice(profile); if (!hasNext) await persistTracingProgress(tracingSession.drill.id); const feedback = root.querySelector('#trace-feedback'); feedback.className = 'feedback success celebrate'; feedback.textContent = hasNext ? `${ui().great} ${tracingSession.drill.forms[nextIndex].label}.` : `${ui().great} ⭐`; showMascotCelebration(); const retry = root.querySelector('[data-action="retry-trace"]'); retry.disabled = hasNext; retry.textContent = copy().retry; speak(ui().great); setTimeout(() => { if (!tracingSession?.completed) return; if (hasNext) startTracing(tracingSession.drill.id, nextIndex); else { tracingSession = null; view = 'letters'; render(); } }, 1200);
}

function finishNameTracing() {
  tracingSession.completed = true;
  rewardPractice(profile);
  const feedback = root.querySelector('#trace-feedback');
  feedback.className = 'feedback success celebrate';
  feedback.textContent = copy().nameDone.replace('{name}', tracingSession.nameValue);
  showMascotCelebration();
  speak(ui().great);
  setTimeout(() => {
    if (!tracingSession?.completed) return;
    const language = pack(); updateLanguageProgress(profile, language.metadata.id, { namePracticeCompleted: true }); tracingSession = null; view = 'letters'; render();
  }, 1250);
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
  speak(item.word);
}

function selectLetter(button, item) { if (session.solved || button.classList.contains('selected') || session.picks.length >= item.word.length) return; const expected = item.word[session.picks.length]; if (button.dataset.letter !== expected) { button.classList.add('wrong'); speak(button.dataset.letter); setTimeout(() => button.classList.remove('wrong'), 650); return; } button.classList.add('selected', 'correct'); session.picks.push(button.dataset.letter); session.pickButtons.push(button); updateAnswer(item); }
function updateAnswer(item) { const joining = pack().writingRules?.joining; const selected = joining ? session.picks.map((letter, index) => optionGlyph(pack(), item.word, index, letter)).join('') : session.picks.join(' '); const answer = root.querySelector('#answer'); answer.dir = joining ? 'rtl' : 'ltr'; answer.textContent = selected + (selected ? ' ' : '') + '_ '.repeat(item.word.length - session.picks.length); root.querySelector('[data-action="undo"]').disabled = !session.picks.length; root.querySelector('[data-action="check"]').disabled = session.picks.length !== item.word.length; }
function undoPick() { const button = session.pickButtons.pop(); if (button) button.classList.remove('selected'); session.picks.pop(); const item = pack().curriculum[session.lessonIndex].words[session.wordIndex]; updateAnswer(item); }
function useHint(item, button) { if (session.hintUsed) return; const target = [...root.querySelectorAll('[data-letter]')].find(node => node.dataset.letter === item.word[session.picks.length] && !node.classList.contains('selected')); if (target) target.classList.add('hinted'); session.hintUsed = true; button.disabled = true; root.querySelector('#feedback').textContent = `${ui().listenPrompt} ${item.word[session.picks.length]}`; speak(item.word[session.picks.length]); }
async function check(item, lesson) { const feedback = root.querySelector('#feedback'); if (session.solved) return nextWord(lesson); if (session.picks.join('') === item.word) { session.solved = true; session.pickButtons.forEach(button => button.classList.add('correct')); feedback.className = 'feedback success celebrate'; feedback.textContent = `${ui().great} ⭐`; showMascotCelebration(); root.querySelector('[data-action="check"]').textContent = `✅ ${ui().next}`; root.querySelector('[data-action="undo"]').disabled = true; rewardPractice(profile); await persistCloudProgress(); speak(ui().great); } else { session.mistakes += 1; feedback.className = 'feedback error'; session.pickButtons.forEach(button => button.classList.add('wrong')); if (session.mistakes >= 3) { feedback.textContent = ui().restart; setTimeout(() => { session = null; view = 'home'; render(); }, 1100); } else { feedback.textContent = `${ui().tryAgain} (${3 - session.mistakes})`; setTimeout(() => session.pickButtons.forEach(button => button.classList.remove('wrong')), 650); session.picks = []; session.pickButtons.forEach(button => button.classList.remove('selected', 'correct')); session.pickButtons = []; updateAnswer(item); speak(item.word); } } }
async function nextWord(lesson) { const language = pack(); const progress = languageProgress(profile, language.metadata.id); if (session.wordIndex >= lesson.words.length - 1) { const completed = [...new Set([...progress.completed, session.lessonIndex])]; updateLanguageProgress(profile, language.metadata.id, { completed, activeLesson: Math.min(session.lessonIndex + 1, language.curriculum.length - 1), wordIndex: 0 }); await persistCloudProgress(); session = null; view = 'home'; render(); return; } session.wordIndex += 1; session.picks = []; session.pickButtons = []; session.solved = false; session.hintUsed = false; updateLanguageProgress(profile, language.metadata.id, { activeLesson: session.lessonIndex, wordIndex: session.wordIndex }); await persistCloudProgress(); render(); }

function renderParent() { const language = pack(); const homeLanguage = languageCatalog.find(item => item.id === profile.homeLanguage); const progress = languageProgress(profile, language.metadata.id); root.innerHTML = `${header()}<main class="screen parent"><button class="back" data-action="home">← ${ui().back}</button><div class="eyebrow">${ui().parents}</div><h1>${ui().parentTitle}</h1><div class="parent-grid"><div class="metric"><strong>${progress.completed.length}</strong><small>${ui().worldsDone}</small></div><div class="metric"><strong>${profile.rewards.streak}</strong><small>${ui().days}</small></div><div class="metric"><strong>${profile.rewards.stars}</strong><small>${ui().stars}</small></div></div><div class="switch-row"><span>${ui().homeLanguage}</span><button class="speaker" data-action="home-language">${homeLanguage.flag} ${homeLanguage.nativeName}</button></div><div class="switch-row"><span>${ui().adSetting}</span><label><input id="ads" type="checkbox" ${profile.preferences.adsEnabled ? 'checked' : ''}> ${ui().on}</label></div><p class="intro">${ui().savedNote}</p></main>${adBanner()}`; bindHeader(); root.querySelector('[data-action="home"]').addEventListener('click', () => { view = 'home'; render(); }); root.querySelector('[data-action="home-language"]').addEventListener('click', () => { languageTarget = 'native'; view = 'languages'; render(); }); root.querySelector('#ads').addEventListener('change', event => { profile.preferences.adsEnabled = event.target.checked; saveProfile(profile); render(); }); }
function bindHeader() { root.querySelector('[data-action="languages"]')?.addEventListener('click', () => { view = 'languages'; render(); }); root.querySelector('[data-action="child-name"]')?.addEventListener('click', () => { view = 'child-name'; render(); }); root.querySelector('[data-action="parent"]')?.addEventListener('click', () => { view = 'parent'; render(); }); if (cloudUser) { const stats = root.querySelector('.stat-row'); if (stats && !stats.querySelector('[data-action="signout"]')) { const button = document.createElement('button'); button.className = 'chip signout'; button.dataset.action = 'signout'; button.textContent = 'Uitloggen'; stats.appendChild(button); } root.querySelector('[data-action="signout"]')?.addEventListener('click', async () => { await signOut(); cloudUser = null; profile.account = null; saveProfile(profile); authMode = 'choice'; view = 'auth'; render(); }); } }
function renderAuth() {
  const t = copy(); const choosing = authMode === 'choice'; const login = authMode === 'login';
  const googleText = ({ nl: { or:'of', button:'Doorgaan met Google', online:'Google-login werkt in de online versie van Lumio.' }, en: { or:'or', button:'Continue with Google', online:'Google sign-in works in the online version of Lumio.' }, fa: { or:'یا', button:'ادامه با گوگل', online:'ورود با گوگل در نسخهٔ آنلاین لومیو کار می‌کند.' } })[profile.appLanguage || 'nl'];
  if (choosing) {
    root.innerHTML = `<main class="screen account-screen"><section class="hero auth-choice"><div class="eyebrow">Lumio</div><h1>${t.welcome}</h1><p>${t.beginJourney}</p><div class="account-choices"><button class="choice-button guest-choice" data-action="guest"><span class="choice-icon">▶</span><span><strong>${t.playGuest}</strong><small>${t.beginNow}</small></span></button><button class="choice-button account-choice" data-action="signup"><span class="choice-icon">★</span><span><strong>${t.createAccount}</strong><small>${t.saveProgress}</small></span></button></div><button class="login-link" data-action="login">${t.haveAccount} <strong>${t.logIn}</strong></button></section></main>`;
    root.querySelector('[data-action="signup"]').onclick = () => { authMode = 'signup'; render(); };
    root.querySelector('[data-action="login"]').onclick = () => { authMode = 'login'; render(); };
    root.querySelector('[data-action="guest"]').onclick = () => { cloudUser = null; profile.account = null; saveProfile(profile); view = 'child-name'; render(); }; return;
  }
  root.innerHTML = `<main class="screen account-screen"><section class="hero auth-form-card"><button class="back-auth" data-action="back-auth" aria-label="${ui().back}">←</button><div class="eyebrow">Lumio</div><h1>${login ? t.welcomeBack : t.createAccount}</h1><p>${login ? t.continueJourney : t.saveHero}</p><form id="auth-form" class="auth-form"><label>${t.email}<input id="auth-email" type="email" autocomplete="email" required placeholder="you@example.com"></label><label>${t.password}<input id="auth-password" type="password" minlength="4" required placeholder="${profile.appLanguage === 'en' ? 'at least 4 characters' : 'minimaal 4 tekens'}"></label><button class="button primary">${login ? t.login : t.signup}</button></form><p class="auth-message" id="auth-message"></p><button class="login-link" data-action="auth-mode">${login ? t.createAccount : `${t.haveAccount} ${t.logIn}`}</button></section></main>`;
  root.querySelector('#auth-form').insertAdjacentHTML('afterend', `<div class="auth-divider"><span>${googleText.or}</span></div><button class="google-login" type="button" data-action="google-login" aria-label="${googleText.button}"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.12-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"/></svg><span>${googleText.button}</span></button>`);
  root.querySelector('[data-action="google-login"]').onclick = async () => { const message = root.querySelector('#auth-message'); if (!/^https?:$/.test(window.location.protocol)) { message.textContent = googleText.online; return; } message.textContent = `${googleText.button}…`; const result = await signInWithGoogle(); if (result?.error) message.textContent = result.error.message; };
  root.querySelector('#auth-form').onsubmit = async event => { event.preventDefault(); const email = root.querySelector('#auth-email').value.trim().toLowerCase(); const password = root.querySelector('#auth-password').value; const message = root.querySelector('#auth-message'); message.textContent = login ? `${t.login}…` : `${t.signup}…`; const result = login ? await signIn(email, password) : await signUp(email, password); if (result.error) { message.textContent = result.error.message; return; } if (!result.data.session) { message.textContent = t.checkEmail; return; } cloudUser = result.data.user; profile.account = { email, provider: 'supabase' }; saveProfile(profile); await syncCloudProgress(); await syncTracingProgress(); view = profile.childName ? (profile.selectedLanguage ? (profile.selectedGame === 'letter-trail' ? 'letters' : profile.selectedGame ? 'home' : 'games') : 'languages') : 'child-name'; render(); };
  root.querySelector('[data-action="auth-mode"]').onclick = () => { authMode = login ? 'signup' : 'login'; render(); };
  root.querySelector('[data-action="back-auth"]').onclick = () => { authMode = 'choice'; render(); };
}

function renderChildName() {
  const t = copy(); const existing = escape(profile.childName || ''); const editing = Boolean(profile.childName);
  const managerText = {
    nl: { profile:'Profielnaam (Latijnse letters)', profileHelp:'Deze naam verschijnt in het profiel.', languageNames:'Naam in andere schriften', languageHelp:'Deze namen worden gebruikt in de schrijflessen.', latinError:'Gebruik alleen Latijnse letters voor de profielnaam.', save:'Namen opslaan' },
    en: { profile:'Profile name (Latin letters)', profileHelp:'This name appears in the profile.', languageNames:'Names in other scripts', languageHelp:'These names are used in the writing lessons.', latinError:'Use only Latin letters for the profile name.', save:'Save names' },
    fa: { profile:'نام پروفایل (با حروف لاتین)', profileHelp:'این نام در پروفایل نمایش داده می‌شود.', languageNames:'نام‌ها با خط‌های دیگر', languageHelp:'این نام‌ها در تمرین‌های نوشتن استفاده می‌شوند.', latinError:'برای نام پروفایل فقط از حروف لاتین استفاده کن.', save:'ذخیره نام‌ها' }
  }[profile.appLanguage || 'nl'];
  const localizedLanguages = editing ? Object.values(languagePackages).filter(language => language.metadata.status === 'ready' && needsLocalizedName(language)) : [];
  const localizedFields = localizedLanguages.map(language => {
    const value = escape(profile.localizedNames?.[language.metadata.id] || '');
    return `<label class="localized-name-field" dir="${language.writingRules.direction}"><span>${languageFlags(language.metadata)} ${language.metadata.nativeName}</span><input data-localized-name="${language.metadata.id}" type="text" dir="${language.writingRules.direction}" maxlength="24" required value="${value}" placeholder="${nativeNameCopy[profile.appLanguage || 'nl']?.placeholder || ''}"></label>`;
  }).join('');
  root.innerHTML = `<main class="screen account-screen"><section class="hero child-name-card"><div class="eyebrow">Lumio</div><div class="name-orb">✏️</div><h1>${editing ? t.changeName : t.childName}</h1><p>${t.childNameHelp}</p><form id="child-name-form" class="auth-form"><label>${editing ? managerText.profile : t.firstName}<small>${editing ? managerText.profileHelp : ''}</small><input id="child-name" type="text" autocomplete="given-name" maxlength="24" required placeholder="${t.exampleName}" value="${existing}" dir="ltr"></label><p class="auth-message name-error" id="name-error"></p>${localizedFields ? `<div class="localized-name-heading"><strong>${managerText.languageNames}</strong><small>${managerText.languageHelp}</small></div>${localizedFields}` : ''}<button class="button primary">${editing ? managerText.save : t.continue}</button></form></section></main>`;
  root.querySelector('#child-name-form').onsubmit = event => {
    event.preventDefault();
    const name = root.querySelector('#child-name').value.trim().replace(/\s+/g, ' '); if (!name) return;
    const latinName = /^[\p{Script=Latin}\p{M} .'-]+$/u.test(name); const error = root.querySelector('#name-error');
    if (!latinName) { error.textContent = managerText.latinError; root.querySelector('#child-name').focus(); return; }
    const changed = profile.childName !== name; profile.childName = name; profile.localizedNames = { ...(profile.localizedNames || {}) };
    root.querySelectorAll('[data-localized-name]').forEach(input => {
      const languageId = input.dataset.localizedName; const localizedName = input.value.trim().replace(/\s+/g, ' '); const localizedChanged = profile.localizedNames[languageId] !== localizedName;
      if (localizedName) profile.localizedNames[languageId] = localizedName; else delete profile.localizedNames[languageId];
      if (localizedChanged) updateLanguageProgress(profile, languageId, { namePracticeCompleted: false });
    });
    if (changed) Object.keys(profile.progress || {}).filter(languageId => !profile.localizedNames[languageId]).forEach(languageId => updateLanguageProgress(profile, languageId, { namePracticeCompleted: false }));
    saveProfile(profile);
    view = profile.selectedLanguage ? (profile.selectedGame === 'letter-trail' ? 'letters' : profile.selectedGame ? 'home' : 'games') : 'languages'; render();
  };
}

function header() { const t = copy(); return `<header class="topbar"><button class="brand" data-action="languages" aria-label="Lumio">Lu<span>mio</span></button><div class="stat-row"><button class="chip child-account" data-action="child-name" aria-label="${t.changeChildName}">👤 <span>${escape(profile.childName || t.child)}</span></button><button class="chip" data-action="parent" aria-label="${t.parents}">👨‍👩‍👧</button><span class="chip">🔥 ${profile.rewards.streak || 0}</span><span class="chip">⭐ ${profile.rewards.stars || 0}</span></div></header>`; }

function renderGames() { const language = pack(); const text = ui(); const t = copy(); root.innerHTML = `${header()}<main class="screen"><section class="hero game-picker"><button class="back game-picker-back" data-action="languages">← ${text.back}</button><div class="eyebrow">${language.metadata.nativeName}</div><h1>${t.chooseGame}</h1><p>${t.gameIntro}</p><div class="game-grid">${games().map(game => `<button class="game-choice ${game.status !== 'ready' ? 'coming-soon' : ''}" data-game="${game.id}" ${game.status !== 'ready' ? 'disabled' : ''}><span class="game-choice-icon">${game.icon}</span><span><strong>${game.title}</strong><small>${game.description}</small></span>${game.status !== 'ready' ? `<em>${text.comingSoon}</em>` : '<span class="game-choice-arrow">→</span>'}</button>`).join('')}</div></section></main>${adBanner()}`; root.querySelector('[data-action="languages"]').onclick = () => { view = 'languages'; render(); }; root.querySelectorAll('[data-game]').forEach(button => button.onclick = () => { profile.selectedGame = button.dataset.game; saveProfile(profile); view = button.dataset.game === 'letter-trail' ? 'letters' : 'home'; render(); }); bindHeader(); }

function renderLetters() { const language = pack(); const progress = languageProgress(profile, language.metadata.id); const completed = progress.tracingCompleted || []; const lessonDone = drill => drill.forms.every(form => completed.includes(form.id)); const doneCount = language.writing.filter(lessonDone).length; const t = copy(); const practiceName = nameForLanguage(language); root.innerHTML = `${header()}<main class="screen"><section class="hero letter-picker"><button class="back game-picker-back" data-action="games">← ${t.games}</button><div class="eyebrow">${t.letterTrail}</div><h1>${t.chooseLetter}</h1><p>${t.bothCases}</p><div class="trace-total"><span>${doneCount} / ${language.writing.length} ${t.lettersPractised}</span><div class="progress"><span style="width:${doneCount / language.writing.length * 100}%"></span></div></div><div class="letter-picker-grid">${language.writing.map(drill => `<button class="letter-choice ${lessonDone(drill) ? 'done' : ''}" data-trace-letter="${drill.id}" aria-label="${t.practise} ${drill.shortTitle || drill.letter} ${t.letters}"><strong>${drill.shortTitle || drill.letter}</strong>${lessonDone(drill) ? '<span>✓</span>' : ''}</button>`).join('')}</div></section></main>${adBanner()}`; root.querySelector('[data-action="games"]').onclick = () => { view = 'games'; render(); }; root.querySelectorAll('[data-trace-letter]').forEach(button => button.onclick = () => startTracing(button.dataset.traceLetter)); if (practiceName) { root.querySelector('.letter-picker-grid').insertAdjacentHTML('afterend', `<button class="name-letter-choice ${progress.namePracticeCompleted ? 'done' : ''}" data-action="my-name"><span>✍️</span><span><strong>${t.myName}</strong><small>${progress.namePracticeCompleted ? t.readyAgain : `${t.practise} ${escape(practiceName)}`}</small></span><b>${progress.namePracticeCompleted ? '✓' : '→'}</b></button>`); root.querySelector('[data-action="my-name"]').onclick = startNameTracing; } bindHeader(); }
async function boot() { if (!profile.appLanguage) { view = 'app-language'; render(); return; } try { const sessionState = await currentSession(); cloudUser = sessionState?.user || null; if (cloudUser) { profile.account = { email: cloudUser.email, provider: 'supabase' }; await syncCloudProgress(); await syncTracingProgress(); view = profile.childName ? (profile.selectedLanguage ? (profile.selectedGame === 'letter-trail' ? 'letters' : profile.selectedGame ? 'home' : 'games') : 'languages') : 'child-name'; } else { profile.account = null; saveProfile(profile); view = 'auth'; } } catch (error) { console.warn('Cloud session unavailable; offline mode remains available.', error); } if ('serviceWorker' in navigator) navigator.serviceWorker.register('./service-worker.js').catch(() => {}); render(); }
function renderHome() { const language = pack(); const progress = languageProgress(profile, language.metadata.id); const completed = progress.completed.length; const t = copy(); root.innerHTML = `${header()}<main class="screen"><section class="home-grid"><div class="welcome"><div class="eyebrow" style="color:#e9e5ff">${language.metadata.flag} ${language.metadata.nativeName}</div><h1>${ui().hello}</h1><p>${ui().dailyIntro}</p><button class="daily" data-action="daily">▶ ${ui().daily}</button></div><aside class="reward"><div class="eyebrow">${ui().growth}</div><div class="stars">${'⭐'.repeat(Math.min(3, Math.max(1, profile.rewards.stars || 1)))}</div><strong>${completed} / ${language.curriculum.length} ${ui().worlds}</strong><div class="progress"><span style="width:${completed / language.curriculum.length * 100}%"></span></div></aside></section><div class="level-heading"><button class="back" data-action="games">← ${t.games}</button><div><div class="eyebrow">${t.wordBuilders}</div><h2>${t.chooseLevel}</h2></div></div><section class="lesson-list" aria-label="${ui().worlds}">${language.curriculum.map((lesson, index) => { const locked = index > completed; return `<button class="lesson" data-lesson="${index}" ${locked ? 'disabled' : ''}><span class="lesson-icon">${locked ? '🔒' : lesson.icon}</span><span><strong>${lesson.title}</strong><small>${lesson.skill === 'letter' ? ui().sounds : ui().building}</small></span><span class="lesson-progress">${progress.completed.includes(index) ? '✓' : `${Math.min(10, progress.activeLesson === index ? progress.wordIndex || 0 : 0)}/10`}</span></button>`; }).join('')}</section></main>${adBanner()}`; root.querySelector('[data-action="daily"]').onclick = () => startLesson(progress.activeLesson || 0); root.querySelector('[data-action="games"]').onclick = () => { view = 'games'; render(); }; root.querySelectorAll('[data-lesson]').forEach(button => button.onclick = () => startLesson(Number(button.dataset.lesson))); bindHeader(); }

function bindHeader() { root.querySelector('[data-action="languages"]')?.addEventListener('click', () => { view = 'languages'; render(); }); root.querySelector('[data-action="child-name"]')?.addEventListener('click', () => { view = 'child-name'; render(); }); root.querySelector('[data-action="parent"]')?.addEventListener('click', () => { view = 'parent'; render(); }); if (cloudUser) { const stats = root.querySelector('.stat-row'); if (stats && !stats.querySelector('[data-action="signout"]')) { const button = document.createElement('button'); button.className = 'chip signout'; button.dataset.action = 'signout'; button.textContent = copy().signOut; stats.appendChild(button); } root.querySelector('[data-action="signout"]')?.addEventListener('click', async () => { await signOut(); cloudUser = null; profile.account = null; saveProfile(profile); authMode = 'choice'; view = 'auth'; render(); }); } }

function render() { if (view === 'app-language') renderAppLanguage(); else if (view === 'auth') renderAuth(); else if (view === 'child-name') renderChildName(); else if (view === 'languages') renderLanguages(); else if (view === 'games') renderGames(); else if (view === 'letters') renderLetters(); else if (view === 'tracing') renderTracing(); else if (view === 'game') renderGame(); else if (view === 'parent') renderParent(); else renderHome(); if (!root.querySelector('.release-tag')) root.insertAdjacentHTML('beforeend', `<span class="release-tag">v${RELEASE}</span>`); }

function renderAppLanguage() { const choices = languageCatalog.filter(language => ['nl', 'en', 'fa'].includes(language.id)); const returningToParent = languageTarget === 'app'; root.innerHTML = `<main class="screen account-screen"><section class="hero app-language-card">${returningToParent ? `<button class="back" data-action="back-parent">← ${copy().parents}</button>` : ''}<div class="eyebrow">Lumio</div><h1>Choose app language<br><small>Kies app-taal<br>زبان برنامه را انتخاب کن</small></h1><p>Language for buttons and instructions.</p><div class="account-choices">${choices.map(language => `<button class="choice-button account-choice" data-app-language="${language.id}">${languageFlags(language)}<span><strong>${language.nativeName}</strong></span></button>`).join('')}</div></section></main>`; root.querySelector('[data-action="back-parent"]')?.addEventListener('click', () => { languageTarget = 'learning'; view = 'parent'; render(); }); root.querySelectorAll('[data-app-language]').forEach(button => button.addEventListener('click', () => { profile.appLanguage = button.dataset.appLanguage; saveProfile(profile); view = returningToParent ? 'parent' : 'auth'; languageTarget = 'learning'; render(); })); }

function renderParent() { const language = pack(); const progress = languageProgress(profile, language.metadata.id); const appLanguage = languageCatalog.find(item => item.id === profile.appLanguage); const t = copy(); const labels = profile.appLanguage === 'en' ? { app:'App language', practice:'Practice language' } : { app:'App-taal', practice:'Oefentaal' }; root.innerHTML = `${header()}<main class="screen parent"><button class="back" data-action="home">← ${ui().back}</button><div class="eyebrow">${ui().parents}</div><h1>${ui().parentTitle}</h1><div class="parent-grid"><div class="metric"><strong>${progress.completed.length}</strong><small>${ui().worldsDone}</small></div><div class="metric"><strong>${profile.rewards.streak}</strong><small>${ui().days}</small></div><div class="metric"><strong>${profile.rewards.stars}</strong><small>${ui().stars}</small></div></div><div class="switch-row"><span>${labels.app}</span><button class="speaker" data-action="app-language">${languageFlags(appLanguage)} ${appLanguage.nativeName}</button></div><div class="switch-row"><span>${labels.practice}</span><button class="speaker" data-action="practice-language">${languageFlags(language.metadata)} ${language.metadata.nativeName}</button></div><div class="switch-row"><span>${ui().adSetting}</span><label><input id="ads" type="checkbox" ${profile.preferences.adsEnabled ? 'checked' : ''}> ${ui().on}</label></div><p class="intro">${ui().savedNote}</p></main>${adBanner()}`; bindHeader(); root.querySelector('[data-action="home"]').onclick = () => { view = 'home'; render(); }; root.querySelector('[data-action="app-language"]').onclick = () => { languageTarget = 'app'; view = 'app-language'; render(); }; root.querySelector('[data-action="practice-language"]').onclick = () => { languageTarget = 'learning'; view = 'languages'; render(); }; root.querySelector('#ads').onchange = event => { profile.preferences.adsEnabled = event.target.checked; saveProfile(profile); render(); }; }

const nonJoiningPersianLetters = new Set(['ا', 'آ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'و']);
function optionGlyph(language, word, index, letter) { if (!language.writingRules?.joining) return letter; const letters = Array.from(word); const joinsPrevious = index > 0 && !nonJoiningPersianLetters.has(letters[index - 1]); const joinsNext = index < letters.length - 1 && !nonJoiningPersianLetters.has(letter); return `${joinsPrevious ? '\u200D' : ''}${letter}${joinsNext ? '\u200D' : ''}`; }
function renderGame() { const language = pack(); const lesson = language.curriculum[session.lessonIndex]; const item = lesson.words[session.wordIndex]; const wordLetters = Array.from(item.word); const letters = shuffle([...wordLetters.map((letter, index) => ({ letter, glyph: optionGlyph(language, item.word, index, letter) })), ...shuffle(language.alphabet.filter(letter => !item.word.includes(letter))).slice(0, 3).map(letter => ({ letter, glyph: letter }))]); root.innerHTML = `${header()}<main class="screen game"><div class="game-head"><button class="back" data-action="home">← ${ui().back}</button><div class="progress"><span style="width:${session.wordIndex / lesson.words.length * 100}%"></span></div><span class="count">${session.wordIndex + 1}/10</span></div><section class="game-card"><div class="eyebrow">${lesson.title}</div><div class="picture" role="img" aria-label="${item.word}">${item.emoji}</div><p class="instruction">${lesson.skill === 'letter' ? ui().find : ui().build}</p><div class="answer" id="answer">${'_ '.repeat(item.word.length)}</div><p class="feedback" id="feedback">${ui().gameIntro}</p><div class="letters" id="letters">${letters.map((option, index) => `<button class="letter" data-letter="${option.letter}" data-index="${index}" dir="${language.writingRules?.joining ? 'rtl' : 'ltr'}">${option.glyph}</button>`).join('')}</div><div class="controls"><button class="button soft" data-action="listen">🔊 ${ui().listen}</button><button class="button soft" data-action="hint">💡 ${ui().hint}</button><button class="button soft" data-action="undo" disabled>⌫</button><button class="button primary" data-action="check" disabled>${ui().check}</button></div></section></main>${adBanner()}`; bindHeader(); root.querySelector('[data-action="home"]').onclick = async () => { updateLanguageProgress(profile, language.metadata.id, { activeLesson: session.lessonIndex, wordIndex: session.wordIndex }); await persistCloudProgress(); view = 'home'; render(); }; root.querySelector('[data-action="listen"]').onclick = () => speak(item.word); root.querySelector('[data-action="hint"]').onclick = event => useHint(item, event.currentTarget); root.querySelector('[data-action="undo"]').onclick = undoPick; root.querySelector('[data-action="check"]').onclick = () => check(item, lesson); root.querySelectorAll('[data-letter]').forEach(button => button.onclick = () => selectLetter(button, item)); speak(item.word); }

const nativeNameCopy = {
  nl: { title:'Hoe schrijf je jouw naam in het Perzisch?', intro:'Zo kunnen we later een schrijfoefening met jouw naam maken.', label:'Jouw naam in deze taal', placeholder:'Bijvoorbeeld: علی', continue:'Verder', back:'Terug naar spellen' },
  en: { title:'How is your name written in Persian?', intro:'This lets us create a name-writing activity later.', label:'Your name in this language', placeholder:'For example: علی', continue:'Continue', back:'Back to games' },
  fa: { title:'نام تو به فارسی چگونه نوشته می‌شود؟', intro:'بعداً با این نام برای تو تمرین نوشتن می‌سازیم.', label:'نام تو به فارسی', placeholder:'مثلاً: علی', continue:'ادامه', back:'بازگشت به بازی‌ها' }
};
const needsLocalizedName = language => language.writingRules?.script && language.writingRules.script !== 'latin';
const nameForLanguage = language => profile.localizedNames?.[language.metadata.id] || profile.childName;
function continueToSelectedGame() { view = profile.selectedGame === 'letter-trail' ? 'letters' : 'home'; render(); }
function renderNativeName() { const language = pack(); const t = nativeNameCopy[profile.appLanguage || 'nl']; const previousName = profile.localizedNames?.[language.metadata.id] || ''; const existing = escape(previousName); root.innerHTML = `<main class="screen account-screen"><section class="hero child-name-card" dir="${language.writingRules.direction}"><button class="back" data-action="back-games">← ${t.back}</button><div class="eyebrow">Lumio</div><div class="name-orb">✏️</div><h1>${t.title}</h1><p>${t.intro}</p><form id="localized-name-form" class="auth-form"><label>${t.label}<input id="localized-name" type="text" dir="${language.writingRules.direction}" maxlength="24" required placeholder="${t.placeholder}" value="${existing}"></label><button class="button primary">${t.continue}</button></form></section></main>`; root.querySelector('[data-action="back-games"]').onclick = () => { view = 'games'; render(); }; root.querySelector('#localized-name-form').onsubmit = event => { event.preventDefault(); const name = root.querySelector('#localized-name').value.trim().replace(/\s+/g, ' '); if (!name) return; profile.localizedNames = { ...(profile.localizedNames || {}), [language.metadata.id]: name }; if (name !== previousName) updateLanguageProgress(profile, language.metadata.id, { namePracticeCompleted: false }); saveProfile(profile); continueToSelectedGame(); }; }
function renderGames() { const language = pack(); const text = ui(); const t = copy(); root.innerHTML = `${header()}<main class="screen"><section class="hero game-picker"><button class="back game-picker-back" data-action="languages">← ${text.back}</button><div class="eyebrow">${language.metadata.nativeName}</div><h1>${t.chooseGame}</h1><p>${t.gameIntro}</p><div class="game-grid">${games().map(game => `<button class="game-choice ${game.status !== 'ready' ? 'coming-soon' : ''}" data-game="${game.id}" ${game.status !== 'ready' ? 'disabled' : ''}><span class="game-choice-icon">${game.icon}</span><span><strong>${game.title}</strong><small>${game.description}</small></span>${game.status !== 'ready' ? `<em>${text.comingSoon}</em>` : '<span class="game-choice-arrow">→</span>'}</button>`).join('')}</div></section></main>${adBanner()}`; root.querySelector('[data-action="languages"]').onclick = () => { view = 'languages'; render(); }; root.querySelectorAll('[data-game]').forEach(button => button.onclick = () => { profile.selectedGame = button.dataset.game; saveProfile(profile); if (needsLocalizedName(language) && !profile.localizedNames?.[language.metadata.id]) { view = 'native-name'; render(); return; } continueToSelectedGame(); }); bindHeader(); }
function render() { if (view === 'app-language') renderAppLanguage(); else if (view === 'auth') renderAuth(); else if (view === 'child-name') renderChildName(); else if (view === 'native-name') renderNativeName(); else if (view === 'languages') renderLanguages(); else if (view === 'games') renderGames(); else if (view === 'letters') renderLetters(); else if (view === 'tracing') renderTracing(); else if (view === 'game') renderGame(); else if (view === 'parent') renderParent(); else renderHome(); decorateWithMascot(); if (!root.querySelector('.release-tag')) root.insertAdjacentHTML('beforeend', `<span class="release-tag">v${RELEASE}</span>`); }

root.addEventListener('click', event => { const languageButton = event.target.closest('[data-app-language]'); if (languageButton) document.documentElement.dir = languageButton.dataset.appLanguage === 'fa' ? 'rtl' : 'ltr'; if (!event.target.closest('.parent [data-action="home"]')) return; event.preventDefault(); event.stopImmediatePropagation(); view = 'games'; render(); }, true);

boot();
