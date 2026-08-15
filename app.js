import { languageCatalog, languagePackages } from './data/languages.js';
import { persianAudio } from './data/audio-fa.js';
import { writingPaths, writingConnections } from './data/writing-paths.js';
import { loadProfile, saveProfile, clearProfile, languageProgress, updateLanguageProgress, rewardPractice } from './modules/storage.js';
import { currentSession, signUp, signIn, signInWithGoogle, signOut, deleteAccount, readProgress, writeProgress } from './modules/cloud.js';
import { startAnalytics, setAnalyticsUser, setAnalyticsLanguage, trackEvent } from './modules/analytics.js';
import { validateLatinName, validateLocalizedName, validateTracingText } from './modules/input-validation.js';

const root = document.querySelector('#app');
let profile = loadProfile();
document.documentElement.dir = profile.appLanguage === 'fa' ? 'rtl' : 'ltr';
let view = profile.appLanguage ? (profile.account ? (profile.selectedLanguage ? 'home' : 'languages') : 'auth') : 'app-language';
let session = null;
let languageTarget = 'learning';
let authMode = 'choice';
let cloudUser = null;
const isAnalyticsAdmin = () => cloudUser?.app_metadata?.lumio_admin === true;
let tracingSession = null;
let numberHouseSession = null;
let returnView = null;
let adultGateTarget = null;
let adultGateQuestion = null;
const PROGRESS_ACTIVITY = { words: 'word_builders', tracing: 'tracing', math: 'math' };
const RELEASE = '0.8.1';

const escape = value => String(value).replace(/[&<>"]/g, char => ({ '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;' }[char]));
const clearInputErrorOnEdit = (input, error) => input?.addEventListener('input', () => { input.removeAttribute('aria-invalid'); if (error) error.textContent = ''; });
const shuffle = values => [...values].sort(() => Math.random() - .5);
const pack = () => languagePackages[profile.learningLanguage || profile.selectedLanguage];
const ui = () => languagePackages[profile.appLanguage || 'nl'].ui;
const baseUi = ui;
const appCopy = {
  nl: { welcome:'Welkom!', beginJourney:'Begin jouw leeravontuur.', playGuest:'Speel als gast', beginNow:'Begin meteen met oefenen', createAccount:'Maak een account', saveProgress:'Bewaar jouw voortgang', haveAccount:'Al een account?', logIn:'Log in', welcomeBack:'Welkom terug', continueJourney:'Ga verder met jouw leerreis.', saveHero:'Bewaar de groei van je leerheld voor later.', email:'E-mailadres', password:'Wachtwoord', login:'Inloggen', signup:'Account maken', checkEmail:'Controleer je e-mail en bevestig je account. Daarna kun je inloggen.', childName:'Hoe heet jij?', changeName:'Naam wijzigen', childNameHelp:'We gebruiken jouw naam om een speciale schrijfoefening voor jou te maken.', firstName:'Jouw voornaam', exampleName:'Bijvoorbeeld: Noor', continue:'Verder', child:'Kind', changeChildName:'Naam van kind wijzigen', parents:'Ouders', signOut:'Uitloggen', chooseGame:'Kies een spel', gameIntro:'Kies hoe je vandaag wilt oefenen.', games:'Spellen', chooseLetter:'Kies een letter', bothCases:'Oefen telkens de hoofdletter én de kleine letter.', lettersPractised:'letters geoefend', myName:'Mijn naam schrijven', readyAgain:'Klaar — nog eens oefenen?', practise:'Oefen', letters:'Letters', letterTrail:'Letterspoor', followLetter:'Volg de letter', traceIntro:'Luister naar de klank. Houd de cirkel vast en volg het grijze spoor.', startPurple:'Luister en begin bij de paarse cirkel.', listen:'Luister', retry:'Opnieuw', write:'Schrijf', nameTrail:'Letterspoor · jouw naam', nameIntro:'Een naam bestaat uit losse letters. Volg ze van links naar rechts.', nameStart:'Begin bij de paarse cirkel en volg jouw hele naam.', nextLine:'Goed zo! Volg nu de volgende lijn.', lowercaseNext:'Goed gedaan! Nu de kleine', letterDone:'Goed gedaan! Je hebt de', nameDone:'Fantastisch, {name}! Jij hebt jouw hele naam geschreven.', customTrace:'Schrijf je eigen tekst', customTraceHelp:'Typ een woord of korte zin en oefen die op het scherm.', customTracePlaceholder:'Bijvoorbeeld: Ik hou van lezen', customTraceStart:'Maak mijn letterspoor', customTraceError:'Gebruik letters uit deze taal en minstens één woord.', customTrail:'Letterspoor · jouw tekst', customIntro:'Volg de letters één voor één. Schuif opzij om de hele zin te zien.', customStart:'Begin bij de paarse cirkel en volg de hele tekst.', customDone:'Fantastisch! Je hebt jouw tekst geschreven.', wordBuilders:'Woordbouwers', chooseLevel:'Kies een niveau', math:{ title:'Getallenhuisjes', description:'Vind de twee getallen die samen een getal maken.', eyebrow:'Lumio rekenen', levelIntro:'Begin klein en groei met getallen.', backGames:'Terug naar spellen', backLevels:'Terug naar niveaus', level:'Niveau', upTo:'tot en met', multiply:'Vermenigvuldigen', tablesUpTo:'Tafels tot en met', prompt:'Welke twee getallen maken', choose:'Kies het ontbrekende getal.', tryAgain:'Probeer opnieuw — kijk naar het getal bovenaan.', greatJob:'Goed gedaan! {known} en {answer} maken samen {total}.', progress:'vragen klaar' } },
  en: { welcome:'Welcome!', beginJourney:'Start your learning adventure.', playGuest:'Play as guest', beginNow:'Start practising right away', createAccount:'Create an account', saveProgress:'Save your progress', haveAccount:'Already have an account?', logIn:'Log in', welcomeBack:'Welcome back', continueJourney:'Continue your learning journey.', saveHero:'Save your little learner’s progress for later.', email:'Email address', password:'Password', login:'Log in', signup:'Create account', checkEmail:'Check your email and confirm your account. Then you can log in.', childName:'What is your name?', changeName:'Change name', childNameHelp:'We use your name to create a special writing activity just for you.', firstName:'Your first name', exampleName:'For example: Sam', continue:'Continue', child:'Child', changeChildName:'Change child name', parents:'Parents', signOut:'Sign out', chooseGame:'Choose a game', gameIntro:'Choose how you would like to practise today.', games:'Games', chooseLetter:'Choose a letter', bothCases:'Practise the capital and lowercase letter each time.', lettersPractised:'letters practised', myName:'Write my name', readyAgain:'Done — practise again?', practise:'Practise', letters:'Letters', letterTrail:'Letter trail', followLetter:'Trace the letter', traceIntro:'Listen to the sound. Hold the circle and follow the grey path.', startPurple:'Listen and start at the purple circle.', listen:'Listen', retry:'Try again', write:'Write', nameTrail:'Letter trail · your name', nameIntro:'A name is made of letters. Follow them from left to right.', nameStart:'Start at the purple circle and follow your whole name.', nextLine:'Nice! Now follow the next line.', lowercaseNext:'Great job! Now the lowercase', letterDone:'Great job! You practised the', nameDone:'Fantastic, {name}! You wrote your whole name.', customTrace:'Write your own text', customTraceHelp:'Type a word or short sentence and practise it on the screen.', customTracePlaceholder:'For example: I love reading', customTraceStart:'Make my letter trail', customTraceError:'Use letters from this language and enter at least one word.', customTrail:'Letter trail · your text', customIntro:'Trace the letters one by one. Scroll sideways to see the whole sentence.', customStart:'Start at the purple circle and trace the whole text.', customDone:'Fantastic! You wrote your own text.', wordBuilders:'Word builders', chooseLevel:'Choose a level', math:{ title:'Number Houses', description:'Find the two numbers that make a number.', eyebrow:'Lumio maths', levelIntro:'Start small and grow your number skills.', backGames:'Back to games', backLevels:'Back to levels', level:'Level', upTo:'up to', multiply:'Multiplication', tablesUpTo:'Tables up to', prompt:'Which two numbers make', choose:'Choose the missing number.', tryAgain:'Try again — look at the number on the roof.', greatJob:'Great job! {known} and {answer} make {total}.', progress:'questions finished' } }
};
appCopy.fa = { welcome:'خوش آمدی!', beginJourney:'ماجراجویی یادگیری خودت را شروع کن.', playGuest:'بازی به‌عنوان مهمان', beginNow:'همین حالا تمرین را شروع کن', createAccount:'ساخت حساب', saveProgress:'پیشرفت خودت را ذخیره کن', haveAccount:'حساب داری؟', logIn:'ورود', welcomeBack:'خوش برگشتی', continueJourney:'سفر یادگیری‌ات را ادامه بده.', saveHero:'پیشرفت کودک را برای بعد ذخیره کن.', email:'ایمیل', password:'رمز عبور', login:'ورود', signup:'ساخت حساب', checkEmail:'ایمیل خود را بررسی و حسابت را تأیید کن. سپس وارد شو.', childName:'نام تو چیست؟', changeName:'تغییر نام', childNameHelp:'از نام تو برای ساخت یک تمرین نوشتن ویژه استفاده می‌کنیم.', firstName:'نام کوچک تو', exampleName:'مثلاً: علی', continue:'ادامه', child:'کودک', changeChildName:'تغییر نام کودک', parents:'برای والدین', signOut:'خروج', chooseGame:'یک بازی انتخاب کن', gameIntro:'انتخاب کن امروز چطور تمرین کنی.', games:'بازی‌ها', chooseLetter:'یک حرف انتخاب کن', bothCases:'هر بار حرف بزرگ و کوچک را تمرین کن.', lettersPractised:'حرف تمرین شده', myName:'نوشتن نام من', readyAgain:'تمام شد — دوباره تمرین کن', practise:'تمرین', letters:'حروف', letterTrail:'مسیر حرف', followLetter:'حرف را دنبال کن', traceIntro:'به صدا گوش کن. دایره را نگه دار و مسیر خاکستری را دنبال کن.', startPurple:'گوش کن و از دایره بنفش شروع کن.', listen:'گوش کن', retry:'دوباره', write:'بنویس', nameTrail:'مسیر حرف · نام تو', nameIntro:'هر نام از چند حرف ساخته شده است. از راست به چپ آن‌ها را دنبال کن.', nameStart:'از دایره بنفش شروع کن و نام کاملت را دنبال کن.', nextLine:'آفرین! حالا خط بعدی را دنبال کن.', lowercaseNext:'آفرین! حالا حرف کوچک', letterDone:'آفرین! این حروف را تمرین کردی:', nameDone:'آفرین {name}! تو نام کاملت را نوشتی.', customTrace:'نوشتن متن دلخواه', customTraceHelp:'یک واژه یا جملهٔ کوتاه بنویس و آن را روی صفحه تمرین کن.', customTracePlaceholder:'مثلاً: من کتاب می‌خوانم', customTraceStart:'ساخت مسیر نوشتن', customTraceError:'از حروف فارسی استفاده کن و دست‌کم یک واژه بنویس.', customTrail:'مسیر حرف · متن تو', customIntro:'حروف را یکی‌یکی دنبال کن. برای دیدن همهٔ جمله صفحه را کنار بکش.', customStart:'از دایرهٔ بنفش شروع کن و همهٔ متن را دنبال کن.', customDone:'آفرین! متن خودت را نوشتی.', wordBuilders:'واژه‌ساز', chooseLevel:'یک سطح انتخاب کن', math:{ title:'خانه‌های عدد', description:'دو عددی را پیدا کن که با هم یک عدد می‌سازند.', eyebrow:'ریاضی لومیو', levelIntro:'از کوچک شروع کن و با عددها رشد کن.', backGames:'بازگشت به بازی‌ها', backLevels:'بازگشت به سطح‌ها', level:'سطح', upTo:'تا', multiply:'ضرب', tablesUpTo:'جدول ضرب تا', prompt:'کدام دو عدد می‌شوند', choose:'عدد گمشده را انتخاب کن.', tryAgain:'دوباره تلاش کن — به عدد بالای خانه نگاه کن.', greatJob:'آفرین! {known} و {answer} می‌شوند {total}.', progress:'سؤال انجام شد' } };
appCopy.nl.scrollText = 'Tik bovenaan op een letter om ernaartoe te gaan. Veeg om opzij te schuiven en sleep de gele cirkel om te schrijven.';
appCopy.en.scrollText = 'Tap a letter above to jump to it. Swipe to move sideways and drag the yellow circle to write.';
appCopy.fa.scrollText = 'برای رفتن به هر حرف، روی آن در بالا بزن. برای جابه‌جایی بکش و برای نوشتن، دایرهٔ زرد را بکش.';
const copy = () => appCopy[profile.appLanguage || 'nl'];
const setDocumentLanguage = languageId => {
  const language = languagePackages[languageId || 'nl']?.metadata || languagePackages.nl.metadata;
  document.documentElement.lang = language.locale;
  document.documentElement.dir = language.id === 'fa' ? 'rtl' : 'ltr';
};
setDocumentLanguage(profile.appLanguage || 'nl');
Object.assign(appCopy.nl.math, { listen:'Luister', guideTotalAddition:'Hoeveel is {left} plus {right}?', guideTotalMultiplication:'Hoeveel is {left} keer {right}?', guideMissingAddition:'Welk getal plus {known} is samen {total}?', guideMissingMultiplication:'Welk getal keer {known} is {total}?', retryTotalAddition:'Probeer opnieuw — tel de twee getallen onderaan bij elkaar op.', retryTotalMultiplication:'Probeer opnieuw — vermenigvuldig de twee getallen onderaan.', retryMissing:'Probeer opnieuw — kijk naar het totaal op het dak.', resultAddition:'Goed gedaan! {left} plus {right} is {total}.', resultMultiplication:'Goed gedaan! {left} keer {right} is {total}.', lostTitle:'Even opnieuw kijken', lostMessage:'Dat is lastig, maar Lumio weet dat jij het kunt. Probeer deze oefening opnieuw of kies een ander niveau.', restartLevel:'Probeer dit niveau opnieuw', chooseAnotherLevel:'Kies een ander niveau', locked:'Voltooi eerst alle vorige niveaus' });
Object.assign(appCopy.en.math, { listen:'Listen', guideTotalAddition:'What is {left} plus {right}?', guideTotalMultiplication:'What is {left} times {right}?', guideMissingAddition:'What number plus {known} makes {total}?', guideMissingMultiplication:'What number times {known} makes {total}?', retryTotalAddition:'Try again — add the two numbers at the bottom.', retryTotalMultiplication:'Try again — multiply the two numbers at the bottom.', retryMissing:'Try again — look at the total on the roof.', resultAddition:'Great job! {left} plus {right} equals {total}.', resultMultiplication:'Great job! {left} times {right} equals {total}.', lostTitle:'Let’s look again', lostMessage:'This one is tricky, but Lumio knows you can do it. Try this level again or choose another level.', restartLevel:'Try this level again', chooseAnotherLevel:'Choose another level', locked:'Finish all previous levels first' });
Object.assign(appCopy.fa.math, { listen:'گوش کن', guideTotalAddition:'{left} به‌علاوهٔ {right} چند می‌شود؟', guideTotalMultiplication:'{left} ضربدر {right} چند می‌شود؟', guideMissingAddition:'چه عددی به‌علاوهٔ {known} می‌شود {total}؟', guideMissingMultiplication:'چه عددی ضربدر {known} می‌شود {total}؟', retryTotalAddition:'دوباره تلاش کن — دو عدد پایین را با هم جمع کن.', retryTotalMultiplication:'دوباره تلاش کن — دو عدد پایین را در هم ضرب کن.', retryMissing:'دوباره تلاش کن — به عدد روی سقف نگاه کن.', resultAddition:'آفرین! {left} به‌علاوهٔ {right} می‌شود {total}.', resultMultiplication:'آفرین! {left} ضربدر {right} می‌شود {total}.', lostTitle:'دوباره نگاه کنیم', lostMessage:'این سؤال سخت است، اما لومیو می‌داند که تو می‌توانی. این سطح را دوباره امتحان کن یا یک سطح دیگر انتخاب کن.', restartLevel:'این سطح را دوباره امتحان کن', chooseAnotherLevel:'یک سطح دیگر انتخاب کن', locked:'اول همهٔ سطح‌های قبلی را تمام کن' });
const mathCopy = () => copy().math;
const navigationCopy = {
  nl: { back:'Terug', backToLogin:'Terug naar aanmelden', home:'Naar spellen', appLanguage:'App-taal', practiceLanguage:'Oefentaal', chooseStyle:'Kies jouw wereld', styleIntro:'Kies een kleurrijke wereld voor elk Lumio-scherm. Je kunt dit altijd veranderen.', style:'Wereldstijl' },
  en: { back:'Back', backToLogin:'Back to sign in', home:'Go to games', appLanguage:'App language', practiceLanguage:'Practice language', chooseStyle:'Choose your world', styleIntro:'Pick a colourful world for every Lumio screen. You can change it anytime.', style:'World style' },
  fa: { back:'بازگشت', backToLogin:'بازگشت به ورود', home:'رفتن به بازی‌ها', appLanguage:'زبان برنامه', practiceLanguage:'زبان تمرین', chooseStyle:'دنیای خودت را انتخاب کن', styleIntro:'برای همهٔ صفحه‌های لومیو یک دنیای رنگارنگ انتخاب کن. هر زمان خواستی می‌توانی آن را تغییر بدهی.', style:'سبک دنیا' }
};
const navCopy = () => navigationCopy[profile.appLanguage || 'nl'];
const childNamePrompts = {
  nl: 'Vul je naam in of vraag je ouders om je te helpen.',
  en: 'Enter your name or ask your parents to help you.',
  fa: 'نامت را بنویس یا از پدر و مادرت کمک بخواه.'
};
const safetyCopy = {
  nl: { adultTitle:'Alleen voor ouders en verzorgers', adultIntro:'Los deze korte vraag op om toegang te krijgen tot accounts, abonnementen en ouderinstellingen.', answer:'Antwoord', continue:'Naar oudergedeelte', wrong:'Dat antwoord klopt niet. Probeer opnieuw.', parentAccount:'Account voor ouders', parentAccountHelp:'Een ouder of wettelijke voogd beheert het account en de toestemming voor kindgegevens.', consent:'Ik ben de ouder of wettelijke voogd en ga akkoord met het privacybeleid voor het opslaan van leergegevens.', privacy:'Privacybeleid', deletion:'Account verwijderen', subscription:'Abonnement', subscriptionNote:'Lumio bevat geen advertenties. Betaalde functies worden later aangeboden via een abonnement dat alleen een volwassene kan beheren.', deleteTitle:'Lumio-account verwijderen', deleteIntro:'Hiermee worden het account, e-mailadres en gekoppelde leerprogressie definitief verwijderd. Lokale namen en voortgang op dit apparaat worden ook gewist.', confirmDelete:'Ik begrijp dat dit niet ongedaan kan worden gemaakt.', deleteNow:'Account en gegevens verwijderen', deleting:'Account wordt verwijderd…', deleteFailed:'Verwijderen is niet gelukt. Probeer opnieuw of gebruik de webpagina voor accountverwijdering.', cancel:'Annuleren' },
  en: { adultTitle:'For parents and guardians only', adultIntro:'Solve this short question to access accounts, subscriptions, and parent settings.', answer:'Answer', continue:'Open parent area', wrong:'That answer is not correct. Try again.', parentAccount:'Parent-managed account', parentAccountHelp:'A parent or legal guardian manages the account and consent for a child’s data.', consent:'I am the parent or legal guardian and agree to the privacy policy for storing learning data.', privacy:'Privacy policy', deletion:'Delete account', subscription:'Subscription', subscriptionNote:'Lumio contains no advertising. Paid features will be offered through a subscription that only an adult can manage.', deleteTitle:'Delete Lumio account', deleteIntro:'This permanently deletes the account, email address, and linked learning progress. Local names and progress on this device will also be erased.', confirmDelete:'I understand that this cannot be undone.', deleteNow:'Delete account and data', deleting:'Deleting account…', deleteFailed:'Deletion failed. Try again or use the web account-deletion page.', cancel:'Cancel' },
  fa: { adultTitle:'فقط برای والدین و سرپرستان', adultIntro:'برای دسترسی به حساب، اشتراک و تنظیمات والدین به این پرسش کوتاه پاسخ دهید.', answer:'پاسخ', continue:'ورود به بخش والدین', wrong:'پاسخ درست نیست. دوباره تلاش کنید.', parentAccount:'حساب تحت مدیریت والدین', parentAccountHelp:'والد یا سرپرست قانونی حساب و رضایت برای داده‌های کودک را مدیریت می‌کند.', consent:'من والد یا سرپرست قانونی هستم و با سیاست حریم خصوصی برای ذخیرهٔ پیشرفت آموزشی موافقم.', privacy:'سیاست حریم خصوصی', deletion:'حذف حساب', subscription:'اشتراک', subscriptionNote:'لومیو هیچ تبلیغی ندارد. امکانات پولی بعداً از طریق اشتراکی ارائه می‌شود که فقط بزرگسال می‌تواند آن را مدیریت کند.', deleteTitle:'حذف حساب لومیو', deleteIntro:'حساب، ایمیل و پیشرفت آموزشی مرتبط برای همیشه حذف می‌شود. نام‌ها و پیشرفت محلی این دستگاه نیز پاک می‌شود.', confirmDelete:'می‌دانم که این کار قابل بازگشت نیست.', deleteNow:'حذف حساب و داده‌ها', deleting:'در حال حذف حساب…', deleteFailed:'حذف انجام نشد. دوباره تلاش کنید یا از صفحهٔ وب حذف حساب استفاده کنید.', cancel:'انصراف' }
};
const safety = () => safetyCopy[profile.appLanguage || 'nl'];
const templates = [
  { id:'default', name:'Lumio original', description:'The calm original Lumio look.', image:null },
  { id:'playground', name:'Pastel playground', description:'A bright world of play and friendship.', image:'./assets/backgrounds/family-01/background-01.jpg' },
  { id:'forest', name:'Forest friends', description:'Explore, learn and grow in the woodland.', image:'./assets/backgrounds/family-02-forest-friends/forest-school.jpg' },
  { id:'ocean', name:'Ocean world', description:'Dive into a colourful underwater classroom.', image:'./assets/backgrounds/family-03-ocean-world/underwater-classroom.jpg' },
  { id:'meadow', name:'Sunny meadow', description:'Follow a gentle path through the countryside.', image:'./assets/backgrounds/family-04-sunny-skies/riverside-balloon.jpg' },
  { id:'cosmic', name:'Cosmic dreams', description:'Reach for the stars and discover new worlds.', image:'./assets/backgrounds/family-05-cosmic-dreams/cosmic-sky.jpg' }
];
const applyTemplate = () => {
  const selected = templates.find(template => template.id === profile.templateId) || templates.find(template => template.id === 'forest');
  profile.templateId = selected.id;
  document.documentElement.dataset.template = selected.id;
  document.documentElement.style.setProperty('--template-bg', selected.image ? `url("${selected.image}")` : 'none');
  document.body.style.backgroundImage = selected.image ? `linear-gradient(rgba(255,253,250,.76),rgba(247,244,255,.76)), url("${selected.image}")` : 'linear-gradient(145deg,#eaf6ff,#fbf2ff 60%,#fff8df)';
  document.body.style.backgroundSize = selected.image ? 'cover, cover' : 'auto';
  document.body.style.backgroundPosition = 'center, center';
  document.body.style.backgroundAttachment = 'fixed';
};
const languageFlags = language => `<span class="flag-set" aria-label="${escape(language.name)}">${(language.flagCodes || []).map(code => `<span class="country-flag flag-${code}" aria-hidden="true"></span>`).join('')}</span>`;
const games = () => [
  ...(pack()?.games || []),
  { id: 'number-houses', title: mathCopy().title, description: mathCopy().description, icon: '🏠', status: 'ready' }
];
const mascotAssets = {
  welcome: './assets/mascot/lumio-welcome.webp',
  learning: './assets/mascot/lumio-learning.webp',
  celebration: './assets/mascot/lumio-celebration.webp',
  tryAgain: './assets/mascot/lumio-try-again.png'
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
const soundEnabled = () => profile.preferences?.soundEnabled !== false;
const soundLabels = {
  nl: { mute:'Alle geluiden uitzetten', unmute:'Geluiden aanzetten' },
  en: { mute:'Mute all sounds', unmute:'Turn sounds on' },
  fa: { mute:'قطع همهٔ صداها', unmute:'روشن کردن صداها' }
};
const soundButton = floating => { const muted = !soundEnabled(); const label = soundLabels[profile.appLanguage || 'nl'][muted ? 'unmute' : 'mute']; return `<button type="button" class="${floating ? 'sound-toggle sound-toggle-floating' : 'chip sound-toggle'}" data-action="sound-toggle" aria-label="${label}" title="${label}" aria-pressed="${muted}">${muted ? '🔇' : '🔊'}</button>`; };
function stopAllAudio() { audioPlaybackToken += 1; activeAudio?.pause(); activeAudio = null; if ('speechSynthesis' in window) speechSynthesis.cancel(); }
function updateSoundButtons() { root.querySelectorAll('[data-action="sound-toggle"]').forEach(button => { const muted = !soundEnabled(); const label = soundLabels[profile.appLanguage || 'nl'][muted ? 'unmute' : 'mute']; button.textContent = muted ? '🔇' : '🔊'; button.setAttribute('aria-label', label); button.setAttribute('title', label); button.setAttribute('aria-pressed', String(muted)); }); }
function speakWithSystemVoice(text, locale) {
  if (!soundEnabled() || !('speechSynthesis' in window)) return;
  const playbackToken = ++audioPlaybackToken;
  speechSynthesis.cancel();
  const say = () => {
    if (!soundEnabled() || playbackToken !== audioPlaybackToken) return;
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
  if (!soundEnabled()) return;
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
    if (!soundEnabled() || playbackToken !== audioPlaybackToken || sourceIndex >= sources.length) return;
    activeAudio = new Audio(sources[sourceIndex++]);
    activeAudio.preload = 'auto';
    activeAudio.addEventListener('ended', playNext, { once: true });
    activeAudio.play().catch(() => speakWithSystemVoice(spokenText, locale));
  };
  playNext();
}

async function syncCloudProgress() { const language = pack(); if (!cloudUser || !language) return; const languageId = language.metadata.id; const rows = await readProgress(cloudUser.id, languageId, PROGRESS_ACTIVITY.words); const progress = languageProgress(profile, languageId); if (!rows.length && (progress.completed.length || progress.wordIndex)) { for (const lessonIndex of progress.completed) await writeProgress(cloudUser.id, languageId, PROGRESS_ACTIVITY.words, lessonIndex + 1, 0, true); await writeProgress(cloudUser.id, languageId, PROGRESS_ACTIVITY.words, progress.activeLesson + 1, progress.wordIndex || 0, progress.completed.includes(progress.activeLesson)); return; } const completed = rows.filter(row => row.completed).map(row => row.level - 1); const active = rows.filter(row => !row.completed).sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at))[0]; updateLanguageProgress(profile, languageId, { completed, activeLesson: active ? Math.max(0, active.level - 1) : progress.activeLesson, wordIndex: active?.word_index || 0 }); }
async function persistCloudProgress() { const language = pack(); if (!cloudUser || !language || !session) return; const languageId = language.metadata.id; const progress = languageProgress(profile, languageId); const currentLevel = session.lessonIndex + 1; await writeProgress(cloudUser.id, languageId, PROGRESS_ACTIVITY.words, currentLevel, progress.activeLesson === session.lessonIndex ? progress.wordIndex : 0, progress.completed.includes(session.lessonIndex)); }
async function syncTracingProgress() { const language = pack(); if (!cloudUser || !language?.writing?.length) return; const rows = await readProgress(cloudUser.id, language.metadata.id, PROGRESS_ACTIVITY.tracing); const tracingCompleted = rows.filter(row => row.level >= 1 && row.level <= language.writing.length && row.completed).map(row => language.writing[row.level - 1]?.id).filter(Boolean); if (tracingCompleted.length) { const progress = languageProgress(profile, language.metadata.id); updateLanguageProgress(profile, language.metadata.id, { tracingCompleted: [...new Set([...(progress.tracingCompleted || []), ...tracingCompleted])] }); } }
async function persistTracingProgress(drillId) { const language = pack(); if (!cloudUser || !language?.writing?.length) return; const index = language.writing.findIndex(item => item.id === drillId); if (index >= 0) await writeProgress(cloudUser.id, language.metadata.id, PROGRESS_ACTIVITY.tracing, index + 1, 0, true); }
async function syncMathProgress() { const language = pack(); if (!cloudUser || !language) return; const rows = await readProgress(cloudUser.id, language.metadata.id, PROGRESS_ACTIVITY.math); if (!rows.length) return; const levels = { ...getMathProgress().levels }; rows.forEach(row => { const id = row.level; const current = levels[id] || {}; levels[id] = { round: Math.max(current.round || 0, row.word_index || 0), stars: current.stars || 0, complete: Boolean(current.complete || row.completed) }; }); saveMathProgress({ levels }); }
async function persistMathProgress(levelId) { const language = pack(); if (!cloudUser || !language) return; const progress = mathLevelProgress(levelId); await writeProgress(cloudUser.id, language.metadata.id, PROGRESS_ACTIVITY.math, levelId, progress.round || 0, Boolean(progress.complete)); }
function legacyRenderAuth() {
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

function legacyRenderChildName() {
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

function legacyRenderAppLanguage() {
  const choices = languageCatalog.filter(language => ['nl', 'en', 'fa'].includes(language.id));
  root.innerHTML = `<main class="screen account-screen"><section class="hero app-language-card"><div class="eyebrow">Lumio</div><h1>Choose app language</h1><p>Kies de taal voor knoppen en uitleg.</p><div class="app-language-options">${choices.map(language => `<button class="choice-button account-choice" data-app-language="${language.id}">${languageFlags(language)}<span><strong>${language.nativeName}</strong><small>${language.id === 'nl' ? 'Nederlands' : 'English'}</small></span></button>`).join('')}</div></section></main>`;
  root.querySelectorAll('[data-app-language]').forEach(button => button.addEventListener('click', () => { profile.appLanguage = button.dataset.appLanguage; saveProfile(profile); view = 'auth'; render(); }));
}

function legacyHeader() { return `<header class="topbar"><button class="brand" data-action="languages" aria-label="Lumio">Lu<span>mio</span></button><div class="stat-row"><button class="chip child-account" data-action="child-name" aria-label="Naam van kind wijzigen">👤 <span>${escape(profile.childName || 'Kind')}</span></button><button class="chip" data-action="parent" aria-label="Ouders">👨‍👩‍👧</button><span class="chip">🔥 ${profile.rewards.streak || 0}</span><span class="chip">⭐ ${profile.rewards.stars || 0}</span></div></header>`; }

function renderLanguages() {
  const text = baseUi();
  const fromParent = languageTarget === 'practice';
  root.innerHTML = `<main class="screen"><section class="hero">${fromParent ? `<button class="back" data-action="back-parent">← ${copy().parents}</button>` : ''}<div class="eyebrow">Lumio</div><h1>${text.chooseWorld}</h1><p>${text.languageIntro}</p><div class="language-grid">${languageCatalog.map(language => { const unavailable = language.status !== 'ready'; return `<article class="language-card"><button class="language-select" data-language="${language.id}" ${unavailable ? 'disabled' : ''}>${languageFlags(language)}<strong>${escape(language.nativeName)}</strong>${unavailable ? `<span class="badge">${text.comingSoon}</span>` : ''}</button><button class="speaker" data-say="${language.id}" aria-label="${text.listen} ${escape(language.nativeName)}">🔊</button></article>`; }).join('')}</div></section></main>`;
  root.querySelector('[data-action="back-parent"]')?.addEventListener('click', () => { languageTarget = 'learning'; view = 'parent'; render(); });
  root.querySelectorAll('[data-language]').forEach(button => button.addEventListener('click', async () => { const id = button.dataset.language; profile.selectedLanguage = id; profile.learningLanguage = id; setAnalyticsLanguage(id); trackEvent('language_selected', { language: id, metadata: { source: 'learning' } }); if (!fromParent) profile.selectedGame = null; saveProfile(profile); await Promise.all([syncCloudProgress(), syncTracingProgress(), syncMathProgress()]); view = fromParent ? 'parent' : 'games'; languageTarget = 'learning'; const chosen = languageCatalog.find(item => item.id === id); speak(chosen.nativeName, chosen.locale); render(); }));
  root.querySelectorAll('[data-say]').forEach(button => button.addEventListener('click', () => { const language = languageCatalog.find(item => item.id === button.dataset.say); speak(language.nativeName, language.locale); }));
}

function legacyRenderGames() {
  const language = pack(); const text = ui();
  root.innerHTML = `${header()}<main class="screen"><section class="hero game-picker"><button class="back game-picker-back" data-action="languages">← ${text.back}</button><div class="eyebrow">${language.metadata.nativeName}</div><h1>Kies een spel</h1><p>Kies hoe je vandaag wilt oefenen.</p><div class="game-grid">${games().map(game => `<button class="game-choice ${game.status !== 'ready' ? 'coming-soon' : ''}" data-game="${game.id}" ${game.status !== 'ready' ? 'disabled aria-disabled="true"' : ''}><span class="game-choice-icon" aria-hidden="true">${game.icon}</span><span><strong>${game.title}</strong><small>${game.description}</small></span>${game.status !== 'ready' ? `<em>${text.comingSoon}</em>` : '<span class="game-choice-arrow" aria-hidden="true">→</span>'}</button>`).join('')}</div></section></main>`;
  root.querySelector('[data-action="languages"]').addEventListener('click', () => { view = 'languages'; render(); });
  root.querySelectorAll('[data-game]').forEach(button => button.addEventListener('click', () => { profile.selectedGame = button.dataset.game; saveProfile(profile); if (button.dataset.game === 'letter-trail') { view = 'letters'; render(); } else { view = 'home'; render(); } }));
  bindHeader();
}

function legacyRenderLetters() {
  const language = pack(); const progress = languageProgress(profile, language.metadata.id); const completed = progress.tracingCompleted || []; const lessonDone = drill => drill.forms.every(form => completed.includes(form.id)); const doneCount = language.writing.filter(lessonDone).length;
  root.innerHTML = `${header()}<main class="screen"><section class="hero letter-picker"><button class="back game-picker-back" data-action="games">← Spellen</button><div class="eyebrow">Letterspoor</div><h1>Kies een letter</h1><p>Oefen telkens de hoofdletter én de kleine letter.</p><div class="trace-total"><span>${doneCount} / ${language.writing.length} letters geoefend</span><div class="progress"><span style="width:${doneCount / language.writing.length * 100}%"></span></div></div><div class="letter-picker-grid">${language.writing.map(drill => `<button class="letter-choice ${lessonDone(drill) ? 'done' : ''}" data-trace-letter="${drill.id}" aria-label="Oefen letter ${drill.letter} en ${drill.lowercase}"><strong>${drill.letter}<small>${drill.lowercase}</small></strong>${lessonDone(drill) ? '<span>✓</span>' : ''}</button>`).join('')}</div><button class="button primary alphabet-next" data-action="alphabet-next" ${doneCount === language.writing.length ? '' : 'disabled'}>Volgende →</button></section></main>`;
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
function traceTextCharacters(language, value, preserveLatinCase = true) {
  const normalized = String(value || '').trim().replace(/\s+/g, ' ');
  if (language.writingRules?.script === 'arabic') return Array.from(normalized.replace(/ي/g, 'ی').replace(/ك/g, 'ک')).filter(char => char === ' ' || language.writing.some(drill => drill.letter === char || drill.forms.some(form => form.glyph === char)));
  const latin = normalized.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return Array.from(preserveLatinCase ? latin : latin.toLowerCase()).filter(char => char === ' ' || /^[a-z]$/i.test(char));
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
function startTextTracing(value, customPractice = false) {
  const language = pack(); const letters = customPractice ? traceTextCharacters(language, value) : nameCharacters(language); if (!letters.some(letter => letter !== ' ')) return false;
  const nameValue = customPractice ? letters.join('').replace(/\s+/g, ' ').trim() : value;
  const persian = language.writingRules?.script === 'arabic';
  const entries = letters.map((letter, index) => {
    if (letter === ' ') return null;
    if (!persian) { const lowercase = letter.toLowerCase(); const pathKind = customPractice && letter === letter.toUpperCase() ? 'capital' : (!customPractice && index === 0 ? 'capital' : 'lowercase'); return { letter, wordBreakBefore: index > 0 && letters[index - 1] === ' ', path: writingPaths[`${pathKind}-${lowercase}`] }; }
    const contextual = persianNamePath(language, letters, letter, index);
    return contextual ? { letter, wordBreakBefore: index > 0 && letters[index - 1] === ' ', ...contextual } : null;
  }).filter(entry => entry?.path);
  if (!entries.length) return false;
  const nameLetters = entries.map(entry => entry.letter); const namePaths = entries.map(entry => entry.path);
  const drill = { id: customPractice ? 'custom-text' : 'my-name', letter: nameValue, lowercase: nameValue, phoneme: nameValue, title: customPractice ? copy().customTrace : copy().myName };
  tracingSession = { drill, form: { id: drill.id, label: drill.title }, formIndex: 0, path: namePaths[0], namePaths, nameEntries: entries, dragging: false, completed: false, strokeIndex: 0, furthest: 0, namePractice: true, customPractice, nameLetters, nameValue, nameDirection: language.writingRules?.direction || 'ltr' };
  view = 'tracing'; render();
  return true;
}
function startNameTracing() {
  const language = pack();
  if (needsLocalizedName(language) && !profile.localizedNames?.[language.metadata.id]) { view = 'native-name'; render(); return; }
  startTextTracing(nameForLanguage(language), false);
}

function startTracing(drillId, formIndex = 0) {
  const drill = pack().writing?.find(item => item.id === drillId) || pack().writing?.[0];
  const form = drill?.forms?.[formIndex]; if (!drill || !form || !writingPaths[form.pathId]) { view = 'games'; render(); return; }
  tracingSession = { drill, form, formIndex, path: writingPaths[form.pathId], dragging: false, completed: false, strokeIndex: 0, furthest: 0 };
  if (formIndex === 0) { trackEvent('game_started', { language: pack().metadata.id, activityId: 'letter-trail' }); trackEvent('lesson_started', { language: pack().metadata.id, activityId: `letter_trail:${drill.id}` }); }
  view = 'tracing'; render();
}

function renderTracing() {
  if (tracingSession.namePractice) { renderNameTracing(); return; }
  const { drill, path, form } = tracingSession; const t = copy(); const traceGlyph = form.glyph || drill.letter; const tracePhoneme = form.phoneme || drill.phoneme;
  root.innerHTML = `${header()}<main class="screen tracing-screen"><div class="game-head"><button class="back" data-action="letters">← ${t.letters}</button><span class="count">${drill.title}</span></div><section class="tracing-card"><div class="eyebrow">${t.letterTrail}</div><h1>${t.followLetter} ${traceGlyph}</h1><p>${t.traceIntro}</p><div class="trace-stage"><svg id="trace-svg" viewBox="${path.viewBox}" role="img" aria-label="${t.followLetter} ${traceGlyph}: ${form.label}">${path.strokes.map((stroke, index) => `<path class="trace-shadow" d="${stroke}"/><path class="trace-progress" data-trace-progress="${index}" d="${stroke}"/>`).join('')}<circle id="trace-start" class="trace-marker start" r="13"/><circle id="trace-end" class="trace-marker end" r="13"/><circle id="trace-hit-area" class="trace-hit-area" r="34" aria-hidden="true"/><circle id="trace-dot" class="trace-dot" r="17" tabindex="0" role="button" aria-label="${t.followLetter} ${traceGlyph}"/></svg></div><p id="trace-feedback" class="feedback">${t.startPurple}</p><div class="controls"><button class="button soft" data-action="listen-trace">🔊 ${t.listen}</button><button class="button primary" data-action="retry-trace" disabled>${t.retry}</button></div></section></main>`;
  bindHeader();
  root.querySelector('.tracing-card h1').insertAdjacentHTML('afterend', `<div style="display:inline-block;margin:0 0 10px;padding:6px 12px;border-radius:999px;background:var(--purple);color:var(--violet);font-size:.88rem;font-weight:900">${tracingSession.form.label}</div>`);
  root.querySelector('[data-action="letters"]').addEventListener('click', () => { tracingSession = null; view = 'letters'; render(); });
  root.querySelector('[data-action="listen-trace"]').addEventListener('click', () => speak(tracePhoneme));
  root.querySelector('[data-action="retry-trace"]').addEventListener('click', () => startTracing(drill.id, tracingSession.formIndex));
  setupTracing();
  speak(tracePhoneme);
}

function renderNameTracing() {
  const { namePaths, nameEntries, nameLetters, nameValue, nameDirection, customPractice } = tracingSession; const t = copy(); const rtl = nameDirection === 'rtl';
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
  } else { let cursor = 25; placements = nameEntries.map(entry => { if (entry.wordBreakBefore) cursor += 115; const placement = { x: cursor, y: 0 }; cursor += 280; return placement; }); }
  const width = Math.max(360, Math.max(...placements.map(point => point.x + 360)) + 25);
  const letterMap = nameLetters.map((letter, index) => { const shownLetter = rtl || customPractice ? letter : (index === 0 ? letter.toUpperCase() : letter); return `${nameEntries[index]?.wordBreakBefore ? '<span class="name-progress-gap" aria-hidden="true"></span>' : ''}<button type="button" class="name-progress-letter" data-name-letter="${index}" aria-label="${t.write} ${escape(shownLetter)}">${escape(shownLetter)}</button>`; }).join('');
  const strokes = namePaths.map((path, letterIndex) => { const offset = placements[letterIndex]; return `<g data-name-letter-target="${letterIndex}">${path.strokes.map((stroke, strokeIndex) => `<g transform="translate(${offset.x},${offset.y})"><path class="trace-shadow" data-offset-x="${offset.x}" data-offset-y="${offset.y}" d="${stroke}"/><path class="trace-progress" data-trace-progress="${letterIndex}-${strokeIndex}" data-offset-x="${offset.x}" data-offset-y="${offset.y}" d="${stroke}"/></g>`).join('')}</g>`; }).join('');
  const trailTitle = customPractice ? t.customTrail : t.nameTrail; const intro = customPractice ? t.customIntro : t.nameIntro; const startPrompt = customPractice ? t.customStart : t.nameStart;
  root.innerHTML = `${header()}<main class="screen tracing-screen"><div class="game-head"><button class="back" data-action="letters">← ${t.letters}</button><span class="count">${customPractice ? t.customTrace : t.myName}</span></div><section class="tracing-card"><div class="eyebrow">${trailTitle}</div><h1>${t.write}: <span dir="${nameDirection}">${escape(nameValue)}</span></h1><p>${intro}</p><div class="name-progress" dir="${nameDirection}" aria-label="${escape(nameValue)}">${letterMap}</div><div class="trace-stage name-stage" dir="${nameDirection}"><svg id="trace-svg" class="name-svg" style="width:${width}px" viewBox="0 0 ${width} 500" role="img" aria-label="${t.write} ${escape(nameValue)}">${strokes}<circle id="trace-start" class="trace-marker start" r="13"/><circle id="trace-end" class="trace-marker end" r="13"/><circle id="trace-hit-area" class="trace-hit-area" r="34" aria-hidden="true"/><circle id="trace-dot" class="trace-dot" r="17" tabindex="0" role="button" aria-label="${startPrompt}"/></svg></div><p class="trace-scroll-hint"><span aria-hidden="true">↔</span>${t.scrollText}</p><p id="trace-feedback" class="feedback">${startPrompt}</p><div class="controls"><button class="button soft" data-action="listen-trace">🔊 ${t.listen}</button><button class="button primary" data-action="retry-trace">${t.retry}</button></div></section></main>`;
  bindHeader();
  root.querySelector('[data-action="letters"]').addEventListener('click', () => { tracingSession = null; view = 'letters'; render(); });
  root.querySelector('[data-action="listen-trace"]').addEventListener('click', () => speak(nameValue));
  root.querySelector('[data-action="retry-trace"]').addEventListener('click', () => customPractice ? startTextTracing(nameValue, true) : startNameTracing());
  root.querySelectorAll('[data-name-letter]').forEach(button => button.addEventListener('click', () => root.querySelector(`[data-name-letter-target="${button.dataset.nameLetter}"]`)?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })));
  setupTracing(); speak(nameValue);
}

function setupTracing() {
  const svg = root.querySelector('#trace-svg'); const shadows = [...svg.querySelectorAll('.trace-shadow')]; const progresses = [...svg.querySelectorAll('[data-trace-progress]')]; const dot = svg.querySelector('#trace-dot'); const hitArea = svg.querySelector('#trace-hit-area'); const start = svg.querySelector('#trace-start'); const end = svg.querySelector('#trace-end');
  const place = (node, point) => { node.setAttribute('cx', point.x); node.setAttribute('cy', point.y); };
  const activateStroke = () => {
    // Every fragment requires a fresh press. Without this reset, the pointer
    // gesture that finished one stroke can also complete the next short one.
    tracingSession.dragging = false;
    const shadow = shadows[tracingSession.strokeIndex]; const progress = progresses[tracingSession.strokeIndex]; const length = shadow.getTotalLength(); const offsetX = Number(shadow.dataset.offsetX || 0); const offsetY = Number(shadow.dataset.offsetY || 0); const samples = Array.from({ length: 181 }, (_, index) => { const point = shadow.getPointAtLength(length * index / 180); return { x: point.x + offsetX, y: point.y + offsetY }; });
    const firstSample = samples[0]; const lastSample = samples[samples.length - 1]; const directLength = Math.hypot(lastSample.x - firstSample.x, lastSample.y - firstSample.y); tracingSession.easyStraightStroke = length >= 20 && length <= 70 && Math.abs(length - directLength) < 1; tracingSession.samples = samples; tracingSession.length = length; tracingSession.furthest = 0; tracingSession.acceptedMoves = 0; shadows.forEach((node, index) => node.classList.toggle('active-stroke', index === tracingSession.strokeIndex)); progresses.forEach((node, index) => { const segmentLength = shadows[index].getTotalLength(); node.style.strokeDasharray = `${segmentLength} ${segmentLength}`; node.style.strokeDashoffset = String(index < tracingSession.strokeIndex ? 0 : segmentLength); }); if (tracingSession.namePractice) { let cursor = 0; let activeLetter = 0; tracingSession.namePaths.forEach((glyph, letterIndex) => { if (tracingSession.strokeIndex >= cursor && tracingSession.strokeIndex < cursor + glyph.strokes.length) activeLetter = letterIndex; cursor += glyph.strokes.length; }); root.querySelectorAll('[data-name-letter]').forEach((node, letterIndex) => node.classList.toggle('done', letterIndex < activeLetter)); root.querySelector(`[data-name-letter="${activeLetter}"]`)?.classList.add('active'); } place(dot, samples[0]); place(hitArea, samples[0]); place(start, samples[0]); place(end, samples[samples.length - 1]); progress.style.strokeDasharray = `${length} ${length}`; progress.style.strokeDashoffset = String(length);
  };
  activateStroke();
  const nearestPoint = event => { const bounds = svg.getBoundingClientRect(); const x = (event.clientX - bounds.left) * svg.viewBox.baseVal.width / bounds.width; const y = (event.clientY - bounds.top) * svg.viewBox.baseVal.height / bounds.height; let nearest = 0; let distance = Infinity; tracingSession.samples.forEach((point, index) => { const candidate = (point.x - x) ** 2 + (point.y - y) ** 2; if (candidate < distance) { distance = candidate; nearest = index; } }); return nearest; };
  const update = index => { const easyStraightStroke = tracingSession.easyStraightStroke; const maximumStep = easyStraightStroke ? tracingSession.samples.length : 12; const requiredMoves = easyStraightStroke ? 1 : 14; if (index > tracingSession.furthest + maximumStep) return; const progress = progresses[tracingSession.strokeIndex]; if (index > tracingSession.furthest) tracingSession.acceptedMoves = (tracingSession.acceptedMoves || 0) + 1; tracingSession.furthest = Math.max(tracingSession.furthest, index); place(dot, tracingSession.samples[index]); place(hitArea, tracingSession.samples[index]); progress.style.strokeDashoffset = String(tracingSession.length * (1 - tracingSession.furthest / (tracingSession.samples.length - 1))); if (!tracingSession.completed && tracingSession.acceptedMoves >= requiredMoves && tracingSession.furthest >= tracingSession.samples.length - 8) { if (tracingSession.strokeIndex < shadows.length - 1) { tracingSession.strokeIndex += 1; root.querySelector('#trace-feedback').textContent = copy().nextLine; activateStroke(); } else finishTracing(); } };
  const startDrag = event => { event.preventDefault(); tracingSession.dragging = true; svg.setPointerCapture?.(event.pointerId); if (tracingSession.length < 20 && !tracingSession.completed) { const last = tracingSession.samples.length - 1; tracingSession.furthest = last - 12; tracingSession.acceptedMoves = 14; update(last); } };
  const move = event => { if (tracingSession.dragging) update(nearestPoint(event)); };
  const stop = () => { tracingSession.dragging = false; };
  dot.addEventListener('pointerdown', startDrag); hitArea.addEventListener('pointerdown', startDrag); svg.addEventListener('pointermove', move); svg.addEventListener('pointerup', stop); svg.addEventListener('pointercancel', stop);
}

async function finishTracing() {
  if (tracingSession.namePractice) return finishNameTracing();
  tracingSession.completed = true;
  const nextIndex = tracingSession.formIndex + 1; const hasNext = nextIndex < tracingSession.drill.forms.length;
  const language = pack();
  const progress = languageProgress(profile, language.metadata.id);
  const tracingCompleted = [...new Set([...(progress.tracingCompleted || []), tracingSession.form.id])];
  updateLanguageProgress(profile, language.metadata.id, { tracingCompleted });
  rewardPractice(profile);
  if (!hasNext) {
    await persistTracingProgress(tracingSession.drill.id);
    const completedDrills = language.writing.filter(drill => drill.forms.every(form => tracingCompleted.includes(form.id))).length;
    trackEvent('lesson_completed', { language: language.metadata.id, activityId: `letter_trail:${tracingSession.drill.id}` });
    trackEvent('game_completed', { language: language.metadata.id, activityId: 'letter-trail' });
    trackEvent('curriculum_progress', { language: language.metadata.id, activityId: 'letter-trail', progressCurrent: completedDrills, progressTotal: language.writing.length });
  }
  const feedback = root.querySelector('#trace-feedback'); feedback.className = 'feedback success celebrate'; feedback.textContent = hasNext ? `${ui().great} ${tracingSession.drill.forms[nextIndex].label}.` : `${ui().great} ⭐`; showMascotCelebration(); const retry = root.querySelector('[data-action="retry-trace"]'); retry.disabled = hasNext; retry.textContent = copy().retry; speak(ui().great); setTimeout(() => { if (!tracingSession?.completed) return; if (hasNext) startTracing(tracingSession.drill.id, nextIndex); else { tracingSession = null; view = 'letters'; render(); } }, 1200);
}

function finishNameTracing() {
  tracingSession.completed = true;
  rewardPractice(profile);
  const feedback = root.querySelector('#trace-feedback');
  feedback.className = 'feedback success celebrate';
  feedback.textContent = tracingSession.customPractice ? copy().customDone : copy().nameDone.replace('{name}', tracingSession.nameValue);
  showMascotCelebration();
  speak(ui().great);
  setTimeout(() => {
    if (!tracingSession?.completed) return;
    if (!tracingSession.customPractice) { const language = pack(); updateLanguageProgress(profile, language.metadata.id, { namePracticeCompleted: true }); }
    tracingSession = null; view = 'letters'; render();
  }, 1250);
}

function legacyRenderHome() {
  const language = pack(); const progress = languageProgress(profile, language.metadata.id); const completed = progress.completed.length;
  root.innerHTML = `${header()}<main class="screen"><section class="home-grid"><div class="welcome"><div class="eyebrow" style="color:#e9e5ff">${language.metadata.flag} ${language.metadata.nativeName}</div><h1>${ui().hello}</h1><p>${ui().dailyIntro}</p><button class="daily" data-action="daily">▶ ${ui().daily}</button></div><aside class="reward"><div class="eyebrow">${ui().growth}</div><div class="stars">${'⭐'.repeat(Math.min(3, Math.max(1, profile.rewards.stars || 1)))}</div><strong>${completed} / ${language.curriculum.length} ${ui().worlds}</strong><div class="progress"><span style="width:${completed / language.curriculum.length * 100}%"></span></div></aside></section><div class="level-heading"><button class="back" data-action="games">← Spellen</button><div><div class="eyebrow">Woordbouwers</div><h2>Kies een niveau</h2></div></div><section class="lesson-list" aria-label="${ui().worlds}">${language.curriculum.map((lesson, index) => { const locked = index > completed; return `<button class="lesson" data-lesson="${index}" ${locked ? 'disabled aria-disabled="true"' : ''}><span class="lesson-icon">${locked ? '🔒' : lesson.icon}</span><span><strong>${lesson.title}</strong><small>${lesson.skill === 'letter' ? ui().sounds : ui().building}</small></span><span class="lesson-progress">${progress.completed.includes(index) ? '✓' : `${Math.min(10, progress.activeLesson === index ? progress.wordIndex || 0 : 0)}/10`}</span></button>`; }).join('')}</section></main>`;
  root.querySelector('[data-action="daily"]').addEventListener('click', () => startLesson(progress.activeLesson || 0));
  root.querySelector('[data-action="games"]').addEventListener('click', () => { view = 'games'; render(); });
  root.querySelectorAll('[data-lesson]').forEach(button => button.addEventListener('click', () => startLesson(Number(button.dataset.lesson))));
  bindHeader();
}


function startLesson(index) {
  const language = pack(); const progress = languageProgress(profile, language.metadata.id); const lesson = language.curriculum[index];
  const wordIndex = progress.activeLesson === index ? (progress.wordIndex || 0) : 0;
  session = { lessonIndex: index, wordIndex: Math.min(wordIndex, lesson.words.length - 1), picks: [], pickButtons: [], mistakes: 0, hintUsed: false, solved: false };
  trackEvent('game_started', { language: language.metadata.id, activityId: 'word-builders' });
  trackEvent('lesson_started', { language: language.metadata.id, activityId: `word_builders:lesson:${index + 1}` });
  view = 'game'; render();
}

function legacyRenderGame() {
  const language = pack(); const lesson = language.curriculum[session.lessonIndex]; const item = lesson.words[session.wordIndex]; const letters = shuffle([...item.word, ...shuffle(language.alphabet.filter(letter => !item.word.includes(letter))).slice(0, 3)]);
  root.innerHTML = `${header()}<main class="screen game"><div class="game-head"><button class="back" data-action="home">← ${ui().back}</button><div class="progress"><span style="width:${session.wordIndex / lesson.words.length * 100}%"></span></div><span class="count">${session.wordIndex + 1}/10</span></div><section class="game-card"><div class="eyebrow">${lesson.title}</div><div class="picture" role="img" aria-label="${item.word}">${item.emoji}</div><p class="instruction">${lesson.skill === 'letter' ? ui().find : ui().build}</p><div class="answer" id="answer">${'_ '.repeat(item.word.length)}</div><p class="feedback" id="feedback">${ui().gameIntro}</p><div class="letters" id="letters">${letters.map((letter, index) => `<button class="letter" data-letter="${letter}" data-index="${index}">${letter}</button>`).join('')}</div><div class="controls"><button class="button soft" data-action="listen">🔊 ${ui().listen}</button><button class="button soft" data-action="hint">💡 ${ui().hint}</button><button class="button soft" data-action="undo" disabled>⌫</button><button class="button primary" data-action="check" disabled>${ui().check}</button></div></section></main>`;
  bindHeader();
  root.querySelector('[data-action="home"]').addEventListener('click', async () => { updateLanguageProgress(profile, language.metadata.id, { activeLesson: session.lessonIndex, wordIndex: session.wordIndex }); await persistCloudProgress(); view = 'home'; render(); });
  root.querySelector('[data-action="listen"]').addEventListener('click', () => speak(item.word));
  root.querySelector('[data-action="hint"]').addEventListener('click', event => useHint(item, event.currentTarget));
  root.querySelector('[data-action="undo"]').addEventListener('click', undoPick);
  root.querySelector('[data-action="check"]').addEventListener('click', () => check(item, lesson));
  root.querySelectorAll('[data-letter]').forEach(button => button.addEventListener('click', () => selectLetter(button, item)));
  speak(item.word);
}

function selectLetter(button, item) { if (session.solved || button.classList.contains('selected') || session.picks.length >= item.word.length) return; speak(button.dataset.letter); const expected = item.word[session.picks.length]; if (button.dataset.letter !== expected) { button.classList.add('wrong'); setTimeout(() => button.classList.remove('wrong'), 650); return; } button.classList.add('selected', 'correct'); session.picks.push(button.dataset.letter); session.pickButtons.push(button); updateAnswer(item); }
function updateAnswer(item) { const joining = pack().writingRules?.joining; const selected = joining ? session.picks.map((letter, index) => optionGlyph(pack(), item.word, index, letter)).join('') : session.picks.join(' '); const answer = root.querySelector('#answer'); answer.dir = joining ? 'rtl' : 'ltr'; answer.textContent = selected + (selected ? ' ' : '') + '_ '.repeat(item.word.length - session.picks.length); root.querySelector('[data-action="undo"]').disabled = !session.picks.length; root.querySelector('[data-action="check"]').disabled = session.picks.length !== item.word.length; }
function undoPick() { const button = session.pickButtons.pop(); if (button) button.classList.remove('selected'); session.picks.pop(); const item = pack().curriculum[session.lessonIndex].words[session.wordIndex]; updateAnswer(item); }
function useHint(item, button) { if (session.hintUsed) return; const target = [...root.querySelectorAll('[data-letter]')].find(node => node.dataset.letter === item.word[session.picks.length] && !node.classList.contains('selected')); if (target) target.classList.add('hinted'); session.hintUsed = true; button.disabled = true; root.querySelector('#feedback').textContent = `${ui().listenPrompt} ${item.word[session.picks.length]}`; speak(item.word[session.picks.length]); }
async function check(item, lesson) { const feedback = root.querySelector('#feedback'); if (session.solved) return nextWord(lesson); if (session.picks.join('') === item.word) { session.solved = true; session.pickButtons.forEach(button => button.classList.add('correct')); feedback.className = 'feedback success celebrate'; feedback.textContent = `${ui().great} ⭐`; showMascotCelebration(); root.querySelector('[data-action="check"]').textContent = `✅ ${ui().next}`; root.querySelector('[data-action="undo"]').disabled = true; rewardPractice(profile); await persistCloudProgress(); speak(ui().great); } else { session.mistakes += 1; feedback.className = 'feedback error'; session.pickButtons.forEach(button => button.classList.add('wrong')); if (session.mistakes >= 3) { feedback.textContent = ui().restart; setTimeout(() => { session = null; view = 'home'; render(); }, 1100); } else { feedback.textContent = `${ui().tryAgain} (${3 - session.mistakes})`; setTimeout(() => session.pickButtons.forEach(button => button.classList.remove('wrong')), 650); session.picks = []; session.pickButtons.forEach(button => button.classList.remove('selected', 'correct')); session.pickButtons = []; updateAnswer(item); speak(item.word); } } }
async function nextWord(lesson) { const language = pack(); const progress = languageProgress(profile, language.metadata.id); if (session.wordIndex >= lesson.words.length - 1) { const completedLesson = session.lessonIndex; const completed = [...new Set([...progress.completed, completedLesson])]; updateLanguageProgress(profile, language.metadata.id, { completed, activeLesson: Math.min(completedLesson + 1, language.curriculum.length - 1), wordIndex: 0 }); await persistCloudProgress(); trackEvent('lesson_completed', { language: language.metadata.id, activityId: `word_builders:lesson:${completedLesson + 1}` }); trackEvent('game_completed', { language: language.metadata.id, activityId: 'word-builders' }); trackEvent('curriculum_progress', { language: language.metadata.id, activityId: 'word-builders', progressCurrent: completed.length, progressTotal: language.curriculum.length }); session = null; view = 'home'; render(); return; } session.wordIndex += 1; session.picks = []; session.pickButtons = []; session.solved = false; session.hintUsed = false; updateLanguageProgress(profile, language.metadata.id, { activeLesson: session.lessonIndex, wordIndex: session.wordIndex }); await persistCloudProgress(); render(); }

function legacyRenderParent() { renderParent(); }
function legacyBindHeader() { root.querySelector('[data-action="languages"]')?.addEventListener('click', () => { view = 'languages'; render(); }); root.querySelector('[data-action="child-name"]')?.addEventListener('click', () => { view = 'child-name'; render(); }); root.querySelector('[data-action="parent"]')?.addEventListener('click', () => { view = 'parent'; render(); }); if (cloudUser) { const stats = root.querySelector('.stat-row'); if (stats && !stats.querySelector('[data-action="signout"]')) { const button = document.createElement('button'); button.className = 'chip signout'; button.dataset.action = 'signout'; button.textContent = 'Uitloggen'; stats.appendChild(button); } root.querySelector('[data-action="signout"]')?.addEventListener('click', async () => { await signOut(); cloudUser = null; profile.account = null; saveProfile(profile); authMode = 'choice'; view = 'auth'; render(); }); } }
const googleAuthCopy = {
  nl: { or:'of', button:'Doorgaan met Google', online:'Google-login werkt in de online versie van Lumio.' },
  en: { or:'or', button:'Continue with Google', online:'Google sign-in works in the online version of Lumio.' },
  fa: { or:'یا', button:'ادامه با گوگل', online:'ورود با گوگل در نسخهٔ آنلاین لومیو کار می‌کند.' }
};
const googleLoginButton = googleText => `<div class="auth-divider"><span>${googleText.or}</span></div><button class="google-login" type="button" data-action="google-login" aria-label="${googleText.button}"><svg viewBox="0 0 24 24" aria-hidden="true"><path fill="#4285F4" d="M21.6 12.23c0-.71-.06-1.4-.18-2.07H12v3.92h5.38a4.6 4.6 0 0 1-2 3.02v2.54h3.24c1.9-1.75 2.98-4.33 2.98-7.41Z"/><path fill="#34A853" d="M12 22c2.7 0 4.97-.9 6.62-2.36l-3.24-2.54c-.9.6-2.05.96-3.38.96-2.61 0-4.82-1.76-5.61-4.13H3.04v2.62A10 10 0 0 0 12 22Z"/><path fill="#FBBC05" d="M6.39 13.93A6.02 6.02 0 0 1 6.08 12c0-.67.12-1.32.31-1.93V7.45H3.04A10 10 0 0 0 2 12c0 1.61.39 3.14 1.04 4.55l3.35-2.62Z"/><path fill="#EA4335" d="M12 5.94c1.47 0 2.79.5 3.83 1.5l2.87-2.87A9.62 9.62 0 0 0 12 2a10 10 0 0 0-8.96 5.45l3.35 2.62C7.18 7.7 9.39 5.94 12 5.94Z"/></svg><span>${googleText.button}</span></button>`;
function openAdultGate(target) { adultGateTarget = target; adultGateQuestion = { left: 7 + Math.floor(Math.random() * 5), right: 7 + Math.floor(Math.random() * 5) }; view = 'adult-gate'; render(); }
async function completeAdultGate() {
  const target = adultGateTarget; adultGateTarget = null; adultGateQuestion = null;
  if (target === 'parent') { view = 'parent'; render(); return; }
  if (target === 'signout') { await signOut(); cloudUser = null; setAnalyticsUser(null); profile.account = null; profile.guest = false; saveProfile(profile); authMode = 'choice'; returnView = null; view = 'auth'; render(); return; }
  authMode = target === 'signup' ? 'signup' : 'login'; view = 'auth'; render();
}
function renderAdultGate() {
  const t = safety(); const question = adultGateQuestion || { left: 8, right: 9 }; adultGateQuestion = question;
  root.innerHTML = `<main class="screen account-screen"><section class="hero auth-form-card"><button class="back-auth" data-action="gate-back" aria-label="${navCopy().back}">←</button><div class="eyebrow">${t.parentAccount}</div><h1>${t.adultTitle}</h1><p>${t.adultIntro}</p><form class="adult-gate-form" id="adult-gate-form"><label>${question.left} × ${question.right} = <input id="adult-answer" type="number" inputmode="numeric" required aria-label="${t.answer}"></label><button class="button primary">${t.continue}</button></form><p class="auth-message" id="adult-gate-message" aria-live="polite"></p></section></main>`;
  root.querySelector('#adult-gate-form').onsubmit = event => { event.preventDefault(); if (Number(root.querySelector('#adult-answer').value) !== question.left * question.right) { root.querySelector('#adult-gate-message').textContent = t.wrong; return; } completeAdultGate(); };
  root.querySelector('[data-action="gate-back"]').onclick = () => { adultGateTarget = null; view = returnView || (profile.selectedLanguage ? 'games' : 'auth'); render(); };
}
function bindGoogleLogin(googleText, requireConsent = false) {
  const button = root.querySelector('[data-action="google-login"]');
  if (!button) return;
  button.onclick = async () => { const message = root.querySelector('#auth-message'); const consent = root.querySelector('#parent-consent'); if (requireConsent && !consent?.checked) { message.textContent = safety().consent; consent?.focus(); return; } if (!/^https?:$/.test(window.location.protocol)) { message.textContent = googleText.online; return; } message.textContent = `${googleText.button}…`; const result = await signInWithGoogle(); if (result?.error) message.textContent = result.error.message; };
}
function renderAuth() {
  const t = copy(); const choosing = authMode === 'choice'; const login = authMode === 'login';
  const googleText = googleAuthCopy[profile.appLanguage || 'nl'];
  if (choosing) {
    root.innerHTML = `<main class="screen account-screen"><section class="hero auth-choice"><div class="eyebrow">Lumio</div><h1>${t.welcome}</h1><p>${t.beginJourney}</p><div class="account-choices"><button class="choice-button guest-choice" data-action="guest"><span class="choice-icon">▶</span><span><strong>${t.playGuest}</strong><small>${t.beginNow}</small></span></button><button class="choice-button account-choice" data-action="signup"><span class="choice-icon">★</span><span><strong>${safety().parentAccount}</strong><small>${safety().parentAccountHelp}</small></span></button></div><button class="login-link" data-action="login">${t.haveAccount} <strong>${t.logIn}</strong></button><p><a class="policy-link" href="privacy.html" target="_blank" rel="noopener">${safety().privacy}</a></p></section></main>`;
    root.querySelector('[data-action="signup"]').onclick = () => openAdultGate('signup');
    root.querySelector('[data-action="login"]').onclick = () => openAdultGate('login');
    root.querySelector('[data-action="guest"]').onclick = () => { cloudUser = null; setAnalyticsUser(null); profile.account = null; profile.guest = true; saveProfile(profile); view = returnView || (profile.childName ? (profile.selectedLanguage ? (profile.selectedGame ? selectedGameView() : 'games') : 'languages') : 'child-name'); returnView = null; render(); }; return;
  }
  root.innerHTML = `<main class="screen account-screen"><section class="hero auth-form-card"><button class="back-auth" data-action="back-auth" aria-label="${ui().back}">←</button><div class="eyebrow">${safety().parentAccount}</div><h1>${login ? t.welcomeBack : t.createAccount}</h1><p>${login ? t.continueJourney : safety().parentAccountHelp}</p><form id="auth-form" class="auth-form"><label>${t.email}<input id="auth-email" type="email" autocomplete="email" required placeholder="you@example.com"></label><label>${t.password}<input id="auth-password" type="password" minlength="${login ? 4 : 8}" required placeholder="${profile.appLanguage === 'en' ? (login ? 'your password' : 'at least 8 characters') : (login ? 'jouw wachtwoord' : 'minimaal 8 tekens')}"></label><label class="consent-row"><input id="parent-consent" type="checkbox" required><span>${safety().consent} <a class="policy-link" href="privacy.html" target="_blank" rel="noopener">${safety().privacy}</a></span></label><button class="button primary">${login ? t.login : t.signup}</button></form>${googleLoginButton(googleText)}<p class="auth-message" id="auth-message" aria-live="polite"></p><button class="login-link" data-action="auth-mode">${login ? t.createAccount : `${t.haveAccount} ${t.logIn}`}</button></section></main>`;
  bindGoogleLogin(googleText, true);
  root.querySelector('#auth-form').onsubmit = async event => { event.preventDefault(); const email = root.querySelector('#auth-email').value.trim().toLowerCase(); const password = root.querySelector('#auth-password').value; const message = root.querySelector('#auth-message'); message.textContent = login ? `${t.login}…` : `${t.signup}…`; const result = login ? await signIn(email, password) : await signUp(email, password); if (result.error) { message.textContent = result.error.message; return; } if (!result.data.session) { message.textContent = t.checkEmail; return; } cloudUser = result.data.user; setAnalyticsUser(cloudUser); profile.account = { email, provider: 'supabase' }; profile.guest = false; saveProfile(profile); await syncCloudProgress(); await syncTracingProgress(); await syncMathProgress(); view = profile.childName ? (profile.selectedLanguage ? (profile.selectedGame ? selectedGameView() : 'games') : 'languages') : 'child-name'; render(); };
  root.querySelector('[data-action="auth-mode"]').onclick = () => openAdultGate(login ? 'signup' : 'login');
  root.querySelector('[data-action="back-auth"]').onclick = () => { authMode = 'choice'; render(); };
}

function renderChildName() {
  const t = copy(); const existing = escape(profile.childName || ''); const editing = Boolean(profile.childName);
  const managerText = {
    nl: { profile:'Profielnaam (Latijnse letters)', profileHelp:'Gebruik Latijnse letters; deze naam verschijnt in het profiel.', languageNames:'Naam in andere schriften', languageHelp:'Deze namen worden gebruikt in de schrijflessen.', latinError:'Voer een naam in met alleen Latijnse letters.', localizedError:'Gebruik alleen Perzische letters voor deze naam.', save:'Namen opslaan' },
    en: { profile:'Profile name (Latin letters)', profileHelp:'Use Latin letters; this name appears in the profile.', languageNames:'Names in other scripts', languageHelp:'These names are used in the writing lessons.', latinError:'Enter a name using only Latin letters.', localizedError:'Use only Persian letters for this name.', save:'Save names' },
    fa: { profile:'نام پروفایل (با حروف لاتین)', profileHelp:'از حروف لاتین استفاده کن؛ این نام در پروفایل نمایش داده می‌شود.', languageNames:'نام‌ها با خط‌های دیگر', languageHelp:'این نام‌ها در تمرین‌های نوشتن استفاده می‌شوند.', latinError:'نام را فقط با حروف لاتین وارد کن.', localizedError:'برای این نام فقط از حروف فارسی استفاده کن.', save:'ذخیره نام‌ها' }
  }[profile.appLanguage || 'nl'];
  const localizedLanguages = editing ? Object.values(languagePackages).filter(language => language.metadata.status === 'ready' && needsLocalizedName(language)) : [];
  const localizedFields = localizedLanguages.map(language => {
    const value = escape(profile.localizedNames?.[language.metadata.id] || '');
    return `<label class="localized-name-field" dir="${language.writingRules.direction}"><span>${languageFlags(language.metadata)} ${language.metadata.nativeName}</span><input data-localized-name="${language.metadata.id}" type="text" dir="${language.writingRules.direction}" lang="${language.metadata.id}" maxlength="24" value="${value}" placeholder="${nativeNameCopy[profile.appLanguage || 'nl']?.placeholder || ''}" aria-describedby="localized-name-error-${language.metadata.id}"><small class="auth-message field-error" id="localized-name-error-${language.metadata.id}" data-localized-name-error="${language.metadata.id}" aria-live="polite"></small></label>`;
  }).join('');
  const backTarget = editing ? (returnView || (profile.selectedGame ? selectedGameView() : 'games')) : 'auth';
  root.innerHTML = `<main class="screen account-screen"><section class="hero child-name-card"><button class="back" data-action="back-name">← ${editing ? navCopy().back : navCopy().backToLogin}</button><div class="eyebrow">Lumio</div><div class="name-orb">✏️</div><h1>${editing ? t.changeName : t.childName}</h1><p>${t.childNameHelp}</p><form id="child-name-form" class="auth-form" novalidate><label>${editing ? managerText.profile : t.firstName}<small>${managerText.profileHelp}</small><input id="child-name" type="text" autocomplete="given-name" lang="en" maxlength="24" placeholder="${t.exampleName}" value="${existing}" dir="ltr" aria-describedby="name-error"></label><p class="auth-message name-error" id="name-error" aria-live="polite"></p>${localizedFields ? `<div class="localized-name-heading"><strong>${managerText.languageNames}</strong><small>${managerText.languageHelp}</small></div>${localizedFields}` : ''}<button class="button primary">${editing ? managerText.save : t.continue}</button></form></section></main>`;
  root.querySelector('[data-action="back-name"]').onclick = () => { view = backTarget; returnView = null; render(); };
  clearInputErrorOnEdit(root.querySelector('#child-name'), root.querySelector('#name-error'));
  root.querySelectorAll('[data-localized-name]').forEach(input => clearInputErrorOnEdit(input, root.querySelector(`[data-localized-name-error="${input.dataset.localizedName}"]`)));
  if (!editing) speak(childNamePrompts[profile.appLanguage || 'nl']);
  root.querySelector('#child-name-form').onsubmit = event => {
    event.preventDefault();
    const nameInput = root.querySelector('#child-name'); const nameResult = validateLatinName(nameInput.value); const error = root.querySelector('#name-error');
    error.textContent = ''; nameInput.removeAttribute('aria-invalid'); root.querySelectorAll('[data-localized-name-error]').forEach(node => { node.textContent = ''; }); root.querySelectorAll('[data-localized-name]').forEach(input => input.removeAttribute('aria-invalid'));
    if (!nameResult.valid) { error.textContent = managerText.latinError; nameInput.setAttribute('aria-invalid', 'true'); nameInput.focus(); return; }
    const localizedInputs = [...root.querySelectorAll('[data-localized-name]')];
    for (const input of localizedInputs) { const languageId = input.dataset.localizedName; const language = languagePackages[languageId]; const result = validateLocalizedName(input.value, language); if (!result.valid) { root.querySelector(`[data-localized-name-error="${languageId}"]`).textContent = managerText.localizedError; input.setAttribute('aria-invalid', 'true'); input.focus(); return; } input.value = result.value; }
    const name = nameResult.value;
    const changed = profile.childName !== name; profile.childName = name; profile.localizedNames = { ...(profile.localizedNames || {}) };
    localizedInputs.forEach(input => {
      const languageId = input.dataset.localizedName; const localizedName = input.value; const localizedChanged = profile.localizedNames[languageId] !== localizedName;
      if (localizedName) profile.localizedNames[languageId] = localizedName; else delete profile.localizedNames[languageId];
      if (localizedChanged) updateLanguageProgress(profile, languageId, { namePracticeCompleted: false });
    });
    if (changed) Object.keys(profile.progress || {}).filter(languageId => !profile.localizedNames[languageId]).forEach(languageId => updateLanguageProgress(profile, languageId, { namePracticeCompleted: false }));
    saveProfile(profile);
    view = editing ? (returnView || (profile.selectedGame ? selectedGameView() : 'games')) : (profile.selectedLanguage ? (profile.selectedGame ? selectedGameView() : 'games') : 'languages'); returnView = null; render();
  };
}

function header() { const t = copy(); return `<header class="topbar"><button class="brand" data-action="hub" aria-label="${navCopy().home}">Lu<span>mio</span></button><div class="stat-row"><button class="chip child-account" data-action="child-name" aria-label="${t.changeChildName}">👤 <span>${escape(profile.childName || t.child)}</span></button><button class="chip" data-action="templates" aria-label="${navCopy().style}">🎨</button>${soundButton(false)}<button class="chip" data-action="parent" aria-label="${t.parents}">👨‍👩‍👧</button>${isAnalyticsAdmin() ? '<a class="chip admin-view-link" href="admin.html" aria-label="Admin view">📊 Admin</a>' : ''}<span class="chip">🔥 ${profile.rewards.streak || 0}</span><span class="chip">⭐ ${profile.rewards.stars || 0}</span></div></header>`; }

function legacyRenderGames2() { const language = pack(); const text = ui(); const t = copy(); root.innerHTML = `${header()}<main class="screen"><section class="hero game-picker"><button class="back game-picker-back" data-action="languages">← ${text.back}</button><div class="eyebrow">${language.metadata.nativeName}</div><h1>${t.chooseGame}</h1><p>${t.gameIntro}</p><div class="game-grid">${games().map(game => `<button class="game-choice ${game.status !== 'ready' ? 'coming-soon' : ''}" data-game="${game.id}" ${game.status !== 'ready' ? 'disabled' : ''}><span class="game-choice-icon">${game.icon}</span><span><strong>${game.title}</strong><small>${game.description}</small></span>${game.status !== 'ready' ? `<em>${text.comingSoon}</em>` : '<span class="game-choice-arrow">→</span>'}</button>`).join('')}</div></section></main>`; root.querySelector('[data-action="languages"]').onclick = () => { view = 'languages'; render(); }; root.querySelectorAll('[data-game]').forEach(button => button.onclick = () => { profile.selectedGame = button.dataset.game; saveProfile(profile); view = button.dataset.game === 'letter-trail' ? 'letters' : 'home'; render(); }); bindHeader(); }

function renderLetters() { const language = pack(); const progress = languageProgress(profile, language.metadata.id); const completed = progress.tracingCompleted || []; const lessonDone = drill => drill.forms.every(form => completed.includes(form.id)); const doneCount = language.writing.filter(lessonDone).length; const t = copy(); const practiceName = nameForLanguage(language); root.innerHTML = `${header()}<main class="screen"><section class="hero letter-picker"><button class="back game-picker-back" data-action="games">← ${t.games}</button><div class="eyebrow">${t.letterTrail}</div><h1>${t.chooseLetter}</h1><p>${t.bothCases}</p><div class="trace-total"><span>${doneCount} / ${language.writing.length} ${t.lettersPractised}</span><div class="progress"><span style="width:${doneCount / language.writing.length * 100}%"></span></div></div><div class="letter-picker-grid">${language.writing.map(drill => `<button class="letter-choice ${lessonDone(drill) ? 'done' : ''}" data-trace-letter="${drill.id}" aria-label="${t.practise} ${drill.shortTitle || drill.letter} ${t.letters}"><strong>${drill.shortTitle || drill.letter}</strong>${lessonDone(drill) ? '<span>✓</span>' : ''}</button>`).join('')}</div><div class="personal-tracing-lessons"><button class="name-letter-choice custom-text-choice" data-action="custom-text"><span>📝</span><span><strong>${t.customTrace}</strong><small>${t.customTraceHelp}</small></span><b>→</b></button></div></section></main>`; root.querySelector('[data-action="games"]').onclick = () => { view = 'games'; render(); }; root.querySelectorAll('[data-trace-letter]').forEach(button => button.onclick = () => startTracing(button.dataset.traceLetter)); root.querySelector('[data-action="custom-text"]').onclick = () => { view = 'custom-tracing-input'; render(); }; if (practiceName) { root.querySelector('.personal-tracing-lessons').insertAdjacentHTML('afterbegin', `<button class="name-letter-choice ${progress.namePracticeCompleted ? 'done' : ''}" data-action="my-name"><span>✍️</span><span><strong>${t.myName}</strong><small>${progress.namePracticeCompleted ? t.readyAgain : `${t.practise} ${escape(practiceName)}`}</small></span><b>${progress.namePracticeCompleted ? '✓' : '→'}</b></button>`); root.querySelector('[data-action="my-name"]').onclick = startNameTracing; } bindHeader(); }

function renderCustomTracingInput() {
  const language = pack(); const t = copy(); const direction = language.writingRules?.direction || 'ltr';
  root.innerHTML = `${header()}<main class="screen"><section class="hero custom-tracing-card" dir="${direction}"><button class="back game-picker-back" data-action="letters">← ${t.letters}</button><div class="eyebrow">${t.letterTrail}</div><div class="name-orb">📝</div><h1>${t.customTrace}</h1><p>${t.customTraceHelp}</p><form id="custom-tracing-form" class="custom-tracing-form" novalidate><label for="custom-tracing-text">${t.write}</label><textarea id="custom-tracing-text" dir="${direction}" lang="${language.metadata.id}" maxlength="60" rows="3" placeholder="${t.customTracePlaceholder}" aria-describedby="custom-tracing-error"></textarea><p class="auth-message" id="custom-tracing-error" aria-live="polite"></p><button class="button primary">${t.customTraceStart}</button></form></section></main>`;
  bindHeader();
  root.querySelector('[data-action="letters"]').onclick = () => { view = 'letters'; render(); };
  clearInputErrorOnEdit(root.querySelector('#custom-tracing-text'), root.querySelector('#custom-tracing-error'));
  root.querySelector('#custom-tracing-form').onsubmit = event => { event.preventDefault(); const input = root.querySelector('#custom-tracing-text'); const result = validateTracingText(input.value, language); const error = root.querySelector('#custom-tracing-error'); error.textContent = ''; input.removeAttribute('aria-invalid'); if (!result.valid || !startTextTracing(result.value, true)) { error.textContent = t.customTraceError; input.setAttribute('aria-invalid', 'true'); input.focus(); } };
}
async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) return;
  const hadController = Boolean(navigator.serviceWorker.controller);
  let refreshing = false;
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || refreshing) return;
    refreshing = true;
    window.location.reload();
  });
  try {
    const registration = await navigator.serviceWorker.register('./service-worker.js', { updateViaCache: 'none' });
    const activate = worker => worker?.postMessage({ type: 'SKIP_WAITING' });
    activate(registration.waiting);
    registration.addEventListener('updatefound', () => {
      const worker = registration.installing;
      worker?.addEventListener('statechange', () => {
        if (worker.state === 'installed' && navigator.serviceWorker.controller) activate(worker);
      });
    });
    await registration.update();
  } catch (error) {
    console.warn('Automatic update check unavailable.', error);
  }
}
async function boot() {
  if (!profile.appLanguage) { startAnalytics({ appVersion: RELEASE }); registerServiceWorker(); view = 'app-language'; render(); return; }
  try {
    const sessionState = await currentSession(); cloudUser = sessionState?.user || null;
    if (cloudUser) { profile.account = { email: cloudUser.email, provider: 'supabase' }; profile.guest = false; await syncCloudProgress(); await syncTracingProgress(); await syncMathProgress(); view = profile.childName ? (profile.selectedLanguage ? (profile.selectedGame ? selectedGameView() : 'games') : 'languages') : 'child-name'; }
    else if (profile.guest) { profile.account = null; view = profile.childName ? (profile.selectedLanguage ? (profile.selectedGame ? selectedGameView() : 'games') : 'languages') : 'child-name'; }
    else { profile.account = null; view = 'auth'; }
    saveProfile(profile);
  } catch (error) { console.warn('Cloud session unavailable; offline mode remains available.', error); if (profile.guest) view = profile.childName ? (profile.selectedLanguage ? (profile.selectedGame ? selectedGameView() : 'games') : 'languages') : 'child-name'; }
  startAnalytics({ user: cloudUser, appVersion: RELEASE, language: profile.learningLanguage || profile.selectedLanguage });
  registerServiceWorker(); render();
}
function renderHome() { const language = pack(); const progress = languageProgress(profile, language.metadata.id); const completed = progress.completed.length; const t = copy(); root.innerHTML = `${header()}<main class="screen"><section class="home-grid"><div class="welcome"><div class="eyebrow" style="color:#e9e5ff">${language.metadata.flag} ${language.metadata.nativeName}</div><h1>${ui().hello}</h1><p>${ui().dailyIntro}</p><button class="daily" data-action="daily">▶ ${ui().daily}</button></div><aside class="reward"><div class="eyebrow">${ui().growth}</div><div class="stars">${'⭐'.repeat(Math.min(3, Math.max(1, profile.rewards.stars || 1)))}</div><strong>${completed} / ${language.curriculum.length} ${ui().worlds}</strong><div class="progress"><span style="width:${completed / language.curriculum.length * 100}%"></span></div></aside></section><div class="level-heading"><button class="back" data-action="games">← ${t.games}</button><div><div class="eyebrow">${t.wordBuilders}</div><h2>${t.chooseLevel}</h2></div></div><section class="lesson-list" aria-label="${ui().worlds}">${language.curriculum.map((lesson, index) => { const locked = index > completed; return `<button class="lesson" data-lesson="${index}" ${locked ? 'disabled' : ''}><span class="lesson-icon">${locked ? '🔒' : lesson.icon}</span><span><strong>${lesson.title}</strong><small>${lesson.skill === 'letter' ? ui().sounds : ui().building}</small></span><span class="lesson-progress">${progress.completed.includes(index) ? '✓' : `${Math.min(10, progress.activeLesson === index ? progress.wordIndex || 0 : 0)}/10`}</span></button>`; }).join('')}</section></main>`; root.querySelector('[data-action="daily"]').onclick = () => startLesson(progress.activeLesson || 0); root.querySelector('[data-action="games"]').onclick = () => { view = 'games'; render(); }; root.querySelectorAll('[data-lesson]').forEach(button => button.onclick = () => startLesson(Number(button.dataset.lesson))); bindHeader(); }

function bindHeader() { root.querySelector('[data-action="hub"]')?.addEventListener('click', () => { view = profile.selectedLanguage ? 'games' : 'languages'; render(); }); root.querySelector('[data-action="child-name"]')?.addEventListener('click', () => { returnView = view; view = 'child-name'; render(); }); root.querySelector('[data-action="parent"]')?.addEventListener('click', () => { if (view === 'parent') return; returnView = view; openAdultGate('parent'); }); const stats = root.querySelector('.stat-row'); if (cloudUser) { if (stats && !stats.querySelector('[data-action="signout"]')) { const button = document.createElement('button'); button.className = 'chip account-session-action signout'; button.dataset.action = 'signout'; button.textContent = copy().signOut; stats.appendChild(button); } root.querySelector('[data-action="signout"]')?.addEventListener('click', () => { returnView = view; openAdultGate('signout'); }); } else { if (stats && !stats.querySelector('[data-action="signin"]')) { const button = document.createElement('button'); button.className = 'chip account-session-action signin'; button.dataset.action = 'signin'; button.textContent = copy().logIn; stats.appendChild(button); } root.querySelector('[data-action="signin"]')?.addEventListener('click', () => { returnView = view; openAdultGate('login'); }); } }

function legacyRender1() { if (view === 'app-language') renderAppLanguage(); else if (view === 'auth') renderAuth(); else if (view === 'child-name') renderChildName(); else if (view === 'languages') renderLanguages(); else if (view === 'games') renderGames(); else if (view === 'letters') renderLetters(); else if (view === 'tracing') renderTracing(); else if (view === 'game') renderGame(); else if (view === 'parent') renderParent(); else renderHome(); if (!root.querySelector('.release-tag')) root.insertAdjacentHTML('beforeend', `<span class="release-tag">v${RELEASE}</span>`); }

function renderAppLanguage() { const choices = languageCatalog.filter(language => ['nl', 'en', 'fa'].includes(language.id)); const returningToParent = languageTarget === 'app'; root.innerHTML = `<main class="screen account-screen"><section class="hero app-language-card">${returningToParent ? `<button class="back" data-action="back-parent">← ${copy().parents}</button>` : ''}<div class="eyebrow">Lumio</div><h1>Choose app language<br><small>Kies app-taal<br>زبان برنامه را انتخاب کن</small></h1><p>Language for buttons and instructions.</p><div class="account-choices">${choices.map(language => `<button class="choice-button account-choice" data-app-language="${language.id}">${languageFlags(language)}<span><strong>${language.nativeName}</strong></span></button>`).join('')}</div></section></main>`; root.querySelector('[data-action="back-parent"]')?.addEventListener('click', () => { languageTarget = 'learning'; view = 'parent'; render(); }); root.querySelectorAll('[data-app-language]').forEach(button => button.addEventListener('click', () => { profile.appLanguage = button.dataset.appLanguage; setDocumentLanguage(profile.appLanguage); trackEvent('language_selected', { language: profile.appLanguage, metadata: { source: 'app' } }); saveProfile(profile); view = returningToParent ? 'parent' : 'auth'; languageTarget = 'learning'; render(); })); }

function renderParent() { const language = pack(); const progress = languageProgress(profile, language.metadata.id); const appLanguage = languageCatalog.find(item => item.id === profile.appLanguage); const labels = navCopy(); const safe = safety(); const destination = returnView || (profile.selectedGame ? selectedGameView() : 'games'); root.innerHTML = `${header()}<main class="screen parent"><button class="back" data-action="return">← ${labels.back}</button><div class="eyebrow">${ui().parents}</div><h1>${ui().parentTitle}</h1><div class="parent-grid"><div class="metric"><strong>${progress.completed.length}</strong><small>${ui().worldsDone}</small></div><div class="metric"><strong>${profile.rewards.streak}</strong><small>${ui().days}</small></div><div class="metric"><strong>${profile.rewards.stars}</strong><small>${ui().stars}</small></div></div><div class="switch-row"><span>${labels.appLanguage}</span><button class="speaker" data-action="app-language">${languageFlags(appLanguage)} ${appLanguage.nativeName}</button></div><div class="switch-row"><span>${labels.practiceLanguage}</span><button class="speaker" data-action="practice-language">${languageFlags(language.metadata)} ${language.metadata.nativeName}</button></div><div class="parent-note"><strong>${safe.subscription}</strong><br>${safe.subscriptionNote}</div><p class="intro">${ui().savedNote}</p><div class="parent-links"><a href="privacy.html" target="_blank" rel="noopener">${safe.privacy}</a><a href="account-deletion.html" target="_blank" rel="noopener">${safe.deletion}</a>${cloudUser ? `<button class="danger-link" data-action="delete-account">${safe.deletion}</button>` : ''}</div></main>`; bindHeader(); root.querySelector('[data-action="return"]').onclick = () => { view = destination; returnView = null; render(); }; root.querySelector('[data-action="app-language"]').onclick = () => { languageTarget = 'app'; view = 'app-language'; render(); }; root.querySelector('[data-action="practice-language"]').onclick = () => { languageTarget = 'practice'; view = 'languages'; render(); }; root.querySelector('[data-action="delete-account"]')?.addEventListener('click', () => { view = 'delete-account'; render(); }); }

function renderDeleteAccount() { const safe = safety(); root.innerHTML = `<main class="screen account-screen"><section class="hero delete-card"><div class="eyebrow">${safe.parentAccount}</div><h1>${safe.deleteTitle}</h1><p>${safe.deleteIntro}</p><label class="consent-row"><input id="delete-confirm" type="checkbox"><span>${safe.confirmDelete}</span></label><div class="delete-actions"><button class="button soft" data-action="delete-cancel">${safe.cancel}</button><button class="button primary" data-action="delete-now" disabled>${safe.deleteNow}</button></div><p class="auth-message" id="delete-message" aria-live="polite"></p><p><a class="policy-link" href="account-deletion.html" target="_blank" rel="noopener">${safe.deletion}</a></p></section></main>`; const confirm = root.querySelector('#delete-confirm'); const remove = root.querySelector('[data-action="delete-now"]'); confirm.onchange = () => { remove.disabled = !confirm.checked; }; root.querySelector('[data-action="delete-cancel"]').onclick = () => { view = 'parent'; render(); }; remove.onclick = async () => { remove.disabled = true; root.querySelector('#delete-message').textContent = safe.deleting; const result = await deleteAccount(); if (result.error) { root.querySelector('#delete-message').textContent = safe.deleteFailed; remove.disabled = false; return; } await signOut(); clearProfile(); window.location.reload(); }; }

const nonJoiningPersianLetters = new Set(['ا', 'آ', 'د', 'ذ', 'ر', 'ز', 'ژ', 'و']);
function optionGlyph(language, word, index, letter) { if (!language.writingRules?.joining) return letter; const letters = Array.from(word); const joinsPrevious = index > 0 && !nonJoiningPersianLetters.has(letters[index - 1]); const joinsNext = index < letters.length - 1 && !nonJoiningPersianLetters.has(letter); return `${joinsPrevious ? '\u200D' : ''}${letter}${joinsNext ? '\u200D' : ''}`; }
function renderGame() { const language = pack(); const lesson = language.curriculum[session.lessonIndex]; const item = lesson.words[session.wordIndex]; const wordLetters = Array.from(item.word); const letters = shuffle([...wordLetters.map((letter, index) => ({ letter, glyph: optionGlyph(language, item.word, index, letter) })), ...shuffle(language.alphabet.filter(letter => !item.word.includes(letter))).slice(0, 3).map(letter => ({ letter, glyph: letter }))]); root.innerHTML = `${header()}<main class="screen game"><div class="game-head"><button class="back" data-action="home">← ${ui().back}</button><div class="progress"><span style="width:${session.wordIndex / lesson.words.length * 100}%"></span></div><span class="count">${session.wordIndex + 1}/10</span></div><section class="game-card"><div class="eyebrow">${lesson.title}</div><div class="picture" role="img" aria-label="${item.word}">${item.emoji}</div><p class="instruction">${lesson.skill === 'letter' ? ui().find : ui().build}</p><div class="answer" id="answer">${'_ '.repeat(item.word.length)}</div><p class="feedback" id="feedback">${ui().gameIntro}</p><div class="letters" id="letters">${letters.map((option, index) => `<button class="letter" data-letter="${option.letter}" data-index="${index}" dir="${language.writingRules?.joining ? 'rtl' : 'ltr'}">${option.glyph}</button>`).join('')}</div><div class="controls"><button class="button soft" data-action="listen">🔊 ${ui().listen}</button><button class="button soft" data-action="hint">💡 ${ui().hint}</button><button class="button soft" data-action="undo" disabled>⌫</button><button class="button primary" data-action="check" disabled>${ui().check}</button></div></section></main>`; bindHeader(); root.querySelector('[data-action="home"]').onclick = async () => { updateLanguageProgress(profile, language.metadata.id, { activeLesson: session.lessonIndex, wordIndex: session.wordIndex }); await persistCloudProgress(); view = 'home'; render(); }; root.querySelector('[data-action="listen"]').onclick = () => speak(item.word); root.querySelector('[data-action="hint"]').onclick = event => useHint(item, event.currentTarget); root.querySelector('[data-action="undo"]').onclick = undoPick; root.querySelector('[data-action="check"]').onclick = () => check(item, lesson); root.querySelectorAll('[data-letter]').forEach(button => button.onclick = () => selectLetter(button, item)); speak(item.word); }

const nativeNameCopy = {
  nl: { title:'Hoe schrijf je jouw naam in het Perzisch?', intro:'Zo kunnen we later een schrijfoefening met jouw naam maken.', label:'Jouw naam in deze taal', placeholder:'Bijvoorbeeld: علی', invalid:'Gebruik alleen Perzische letters voor jouw naam.', continue:'Verder', back:'Terug naar spellen' },
  en: { title:'How is your name written in Persian?', intro:'This lets us create a name-writing activity later.', label:'Your name in this language', placeholder:'For example: علی', invalid:'Use only Persian letters for your name.', continue:'Continue', back:'Back to games' },
  fa: { title:'نام تو به فارسی چگونه نوشته می‌شود؟', intro:'بعداً با این نام برای تو تمرین نوشتن می‌سازیم.', label:'نام تو به فارسی', placeholder:'مثلاً: علی', invalid:'نامت را فقط با حروف فارسی وارد کن.', continue:'ادامه', back:'بازگشت به بازی‌ها' }
};
const needsLocalizedName = language => language.writingRules?.script && language.writingRules.script !== 'latin';
const nameForLanguage = language => profile.localizedNames?.[language.metadata.id] || profile.childName;
function selectedGameView() {
  if (profile.selectedGame === 'letter-trail') return 'letters';
  if (profile.selectedGame === 'number-houses') return 'number-house-levels';
  return 'home';
}
function continueToSelectedGame() { view = selectedGameView(); render(); }

const numberHouseLevels = () => {
  const math = mathCopy();
  const addition = [5, 10, 15, 20, 100].map((max, index) => ({ id: index + 1, type: 'addition', label: `${math.level} ${index + 1}`, max, description: `${math.upTo} ${max}`, icon: ['🌱', '🌼', '🌈', '🚀', '🏆'][index] }));
  const multiplication = [3, 5, 7, 8, 9].map((factorMax, index) => ({ id: index + 6, type: 'multiplication', factorMax, label: `${math.level} ${index + 6}`, max: factorMax * factorMax, description: `${math.multiply} · ${math.tablesUpTo} ${factorMax}`, icon: ['✖️', '🔢', '🧩', '🌟', '👑'][index] }));
  return [...addition, ...multiplication];
};
const getMathProgress = () => profile.mathProgressByLanguage?.[pack()?.metadata.id] || { levels: {}, active: null };
const saveMathProgress = change => { const languageId = pack()?.metadata.id; if (!languageId) return; profile.mathProgressByLanguage ||= {}; profile.mathProgressByLanguage[languageId] = { ...getMathProgress(), ...change }; saveProfile(profile); };
const mathLevelProgress = levelId => getMathProgress().levels?.[levelId] || { round: 0, stars: 0, complete: false };
const isMathLevelUnlocked = levelId => numberHouseLevels().filter(level => level.id < levelId).every(level => mathLevelProgress(level.id).complete);

function renderNumberHouseLevels() {
  const math = mathCopy();
  root.innerHTML = `${header()}<main class="screen number-house-levels-screen"><section class="hero game-picker"><button class="back game-picker-back" data-action="games">← ${math.backGames}</button><div class="eyebrow">${math.eyebrow}</div><h1>${copy().chooseLevel}</h1><p>${math.levelIntro}</p><div class="number-level-grid">${numberHouseLevels().map(level => { const progress = mathLevelProgress(level.id); const locked = !isMathLevelUnlocked(level.id); return `<button class="number-level-choice ${progress.complete ? 'done' : ''} ${locked ? 'locked' : ''}" data-number-level="${level.id}" ${locked ? 'disabled aria-disabled="true"' : ''}><span>${locked ? '🔒' : level.icon}</span><strong>${level.label}</strong><small>${level.description}<br>${locked ? math.locked : `${progress.round}/10 ${math.progress} ${progress.complete ? '✓' : ''}`}</small><b>${locked ? '' : '→'}</b></button>`; }).join('')}</div></section></main>`;
  bindHeader();
  root.querySelector('[data-action="games"]').onclick = () => { view = 'games'; render(); };
  root.querySelectorAll('[data-number-level]').forEach(button => button.onclick = () => startNumberHouses(Number(button.dataset.numberLevel)));
}

function startNumberHouses(levelId = 1) {
  const levels = numberHouseLevels();
  const level = levels.find(item => item.id === levelId) || levels[0];
  if (!isMathLevelUnlocked(level.id)) { view = 'number-house-levels'; render(); return; }
  const active = getMathProgress().active;
  if (active?.level?.id === level.id && active.round < active.totalRounds && active.house) { numberHouseSession = active; view = 'number-houses'; render(); return; }
  numberHouseSession = { round: 0, totalRounds: 10, stars: 0, level };
  trackEvent('game_started', { language: pack().metadata.id, activityId: 'number-houses' });
  trackEvent('lesson_started', { language: pack().metadata.id, activityId: `number_houses:level:${level.id}` });
  nextNumberHouse();
}

const appLocale = () => languagePackages[profile.appLanguage || 'nl']?.metadata.locale || 'en-US';
const fillMathText = (text, values) => Object.entries(values).reduce((message, [key, value]) => message.replaceAll(`{${key}}`, value), text);
function speakMath(text) { speakWithSystemVoice(text, appLocale()); }
function mathGuide(house, level) {
  const math = mathCopy();
  const multiplication = level.type === 'multiplication';
  const known = house.missing === 'left' ? house.right : house.left;
  const template = house.missing === 'total'
    ? math[multiplication ? 'guideTotalMultiplication' : 'guideTotalAddition']
    : math[multiplication ? 'guideMissingMultiplication' : 'guideMissingAddition'];
  return fillMathText(template, { left: house.left, right: house.right, known, total: house.total });
}
function mathRetryGuide(house, level) { const math = mathCopy(); return house.missing !== 'total' ? math.retryMissing : math[level.type === 'multiplication' ? 'retryTotalMultiplication' : 'retryTotalAddition']; }
function mathResultGuide(house, level) { const math = mathCopy(); return fillMathText(math[level.type === 'multiplication' ? 'resultMultiplication' : 'resultAddition'], house); }
function resetMathLevel(levelId) {
  numberHouseSession = null;
  saveMathProgress({ levels: { ...getMathProgress().levels, [levelId]: { round: 0, stars: 0, complete: false } }, active: null });
  persistMathProgress(levelId).catch(error => console.warn('Math progress could not sync.', error));
}
function showMathSetback(levelId) {
  const math = mathCopy();
  root.insertAdjacentHTML('beforeend', `<section class="math-setback" role="dialog" aria-modal="true" aria-labelledby="math-setback-title"><div class="math-setback-card">${mascotImage('tryAgain', 'math-setback-mascot')}<div><h2 id="math-setback-title">${math.lostTitle}</h2><p>${math.lostMessage}</p></div><div class="math-setback-actions"><button class="button primary" data-action="restart-math-level">${math.restartLevel}</button><button class="button secondary" data-action="choose-math-level">${math.chooseAnotherLevel}</button></div></div></section>`);
  speakMath(`${math.lostTitle}. ${math.lostMessage}`);
  root.querySelector('[data-action="restart-math-level"]').onclick = () => { resetMathLevel(levelId); startNumberHouses(levelId); };
  root.querySelector('[data-action="choose-math-level"]').onclick = () => { resetMathLevel(levelId); view = 'number-house-levels'; render(); };
}

function nextNumberHouse() {
  const { level, round } = numberHouseSession;
  const asksTotal = round < 2 || Math.random() < .25;
  if (level.type === 'multiplication') {
    const left = 1 + Math.floor(Math.random() * level.factorMax);
    const right = 1 + Math.floor(Math.random() * level.factorMax);
    numberHouseSession.house = asksTotal ? { total: left * right, left, right, answer: left * right, missing: 'total', answered: false, mistakes: 0 } : { total: left * right, left, right, answer: Math.random() < .5 ? left : right, missing: Math.random() < .5 ? 'left' : 'right', answered: false, mistakes: 0 };
    if (numberHouseSession.house.missing === 'left') numberHouseSession.house.answer = left;
    if (numberHouseSession.house.missing === 'right') numberHouseSession.house.answer = right;
  } else {
    const total = 1 + Math.floor(Math.random() * level.max);
    const left = Math.floor(Math.random() * (total + 1));
    const right = total - left;
    numberHouseSession.house = asksTotal ? { total, left, right, answer: total, missing: 'total', answered: false, mistakes: 0 } : { total, left, right, answer: Math.random() < .5 ? left : right, missing: Math.random() < .5 ? 'left' : 'right', answered: false, mistakes: 0 };
    if (numberHouseSession.house.missing === 'left') numberHouseSession.house.answer = left;
    if (numberHouseSession.house.missing === 'right') numberHouseSession.house.answer = right;
  }
  saveMathProgress({ active: numberHouseSession });
  view = 'number-houses';
  render();
}

function renderNumberHouses() {
  const math = mathCopy();
  const { round, totalRounds, stars, house, level } = numberHouseSession || {};
  if (!house) { startNumberHouses(); return; }
  const maxChoice = house.missing === 'total' ? level.max : (level.factorMax || level.max);
  const minimumChoice = level.type === 'multiplication' ? 1 : 0;
  const choices = shuffle([house.answer, ...shuffle(Array.from({ length: maxChoice - minimumChoice + 1 }, (_, index) => index + minimumChoice).filter(number => number !== house.answer)).slice(0, 4)]);
  const roof = house.missing === 'total' ? '?' : house.total;
  const left = house.missing === 'left' ? '?' : house.left;
  const right = house.missing === 'right' ? '?' : house.right;
  const instruction = mathGuide(house, level);
  root.innerHTML = `${header()}<main class="screen number-houses-screen"><div class="game-head"><button class="back" data-action="math-levels">← ${math.backLevels}</button><div class="progress"><span style="width:${round / totalRounds * 100}%"></span></div><span class="count">${round + 1}/${totalRounds}</span></div><section class="number-house-card"><div class="eyebrow">${level.label} · ${level.description}</div><h1>${math.title}</h1><p class="number-house-prompt">${escape(instruction)}</p><div class="number-house" aria-label="${math.title}"><div class="roof-number ${house.missing === 'total' ? 'missing' : ''}" id="house-total">${roof}</div><svg class="house-branches" viewBox="0 0 300 110" aria-hidden="true"><line x1="150" y1="8" x2="55" y2="103"/><line x1="150" y1="8" x2="245" y2="103"/></svg><div class="house-rooms"><div class="house-room ${house.missing === 'left' ? 'missing' : ''}" id="house-left">${left}</div><div class="house-room ${house.missing === 'right' ? 'missing' : ''}" id="house-right">${right}</div></div></div><p class="feedback" id="number-house-feedback">${math.choose}</p><button class="math-listen" type="button" data-action="listen-math" aria-label="${math.listen}">🔊 ${math.listen}</button><div class="number-choices">${choices.map(number => `<button class="number-choice" data-number-choice="${number}">${number}</button>`).join('')}</div><div class="number-stars" aria-label="${stars} stars">${'⭐'.repeat(stars)}</div></section></main>`;
  bindHeader();
  root.querySelector('[data-action="math-levels"]').onclick = () => { numberHouseSession = null; saveMathProgress({ active: null }); view = 'number-house-levels'; render(); };
  root.querySelector('[data-action="listen-math"]').onclick = () => speakMath(instruction);
  setTimeout(() => speakMath(instruction), 180);
  root.querySelectorAll('[data-number-choice]').forEach(button => button.onclick = () => {
    if (numberHouseSession.house.answered) return;
    const choice = Number(button.dataset.numberChoice);
    const feedback = root.querySelector('#number-house-feedback');
    if (choice !== numberHouseSession.house.answer) { numberHouseSession.house.mistakes = (numberHouseSession.house.mistakes || 0) + 1; button.classList.add('wrong'); if (numberHouseSession.house.mistakes >= 3) { numberHouseSession.house.answered = true; feedback.textContent = math.lostTitle; root.querySelectorAll('[data-number-choice]').forEach(item => { item.disabled = true; }); setTimeout(() => showMathSetback(level.id), 550); } else { const retryGuide = mathRetryGuide(numberHouseSession.house, level); feedback.textContent = retryGuide; speakMath(retryGuide); } return; }
    numberHouseSession.house.answered = true;
    button.classList.add('correct');
    root.querySelector(numberHouseSession.house.missing === 'total' ? '#house-total' : numberHouseSession.house.missing === 'left' ? '#house-left' : '#house-right').textContent = choice;
    feedback.textContent = mathResultGuide(numberHouseSession.house, level);
    speakMath(feedback.textContent);
    numberHouseSession.stars += 1;
    showMascotCelebration();
    setTimeout(() => { numberHouseSession.round += 1; const current = mathLevelProgress(numberHouseSession.level.id); const finished = numberHouseSession.round >= numberHouseSession.totalRounds; saveMathProgress({ levels: { ...getMathProgress().levels, [numberHouseSession.level.id]: { round: Math.max(current.round || 0, numberHouseSession.round), stars: Math.max(current.stars || 0, numberHouseSession.stars), complete: current.complete || finished } }, active: finished ? null : numberHouseSession }); persistMathProgress(numberHouseSession.level.id).catch(error => console.warn('Math progress could not sync.', error)); if (finished) { const completedLevel = numberHouseSession.level.id; const completedLevels = numberHouseLevels().filter(item => mathLevelProgress(item.id).complete).length; trackEvent('lesson_completed', { language: pack().metadata.id, activityId: `number_houses:level:${completedLevel}` }); trackEvent('game_completed', { language: pack().metadata.id, activityId: 'number-houses' }); trackEvent('curriculum_progress', { language: pack().metadata.id, activityId: 'number-houses', progressCurrent: completedLevels, progressTotal: numberHouseLevels().length }); numberHouseSession = null; view = 'number-house-levels'; render(); } else nextNumberHouse(); }, 1150);
  });
}
function renderNativeName() { const language = pack(); const t = nativeNameCopy[profile.appLanguage || 'nl']; const previousName = profile.localizedNames?.[language.metadata.id] || ''; const existing = escape(previousName); root.innerHTML = `<main class="screen account-screen"><section class="hero child-name-card" dir="${language.writingRules.direction}"><button class="back" data-action="back-games">← ${t.back}</button><div class="eyebrow">Lumio</div><div class="name-orb">✏️</div><h1>${t.title}</h1><p>${t.intro}</p><form id="localized-name-form" class="auth-form" novalidate><label>${t.label}<input id="localized-name" type="text" dir="${language.writingRules.direction}" lang="${language.metadata.id}" maxlength="24" placeholder="${t.placeholder}" value="${existing}" aria-describedby="localized-name-error"></label><p class="auth-message name-error" id="localized-name-error" aria-live="polite"></p><button class="button primary">${t.continue}</button></form></section></main>`; root.querySelector('[data-action="back-games"]').onclick = () => { view = 'games'; render(); }; const input = root.querySelector('#localized-name'); const error = root.querySelector('#localized-name-error'); clearInputErrorOnEdit(input, error); root.querySelector('#localized-name-form').onsubmit = event => { event.preventDefault(); const result = validateLocalizedName(input.value, language); error.textContent = ''; input.removeAttribute('aria-invalid'); if (!result.valid) { error.textContent = t.invalid; input.setAttribute('aria-invalid', 'true'); input.focus(); return; } const name = result.value; profile.localizedNames = { ...(profile.localizedNames || {}), [language.metadata.id]: name }; if (name !== previousName) updateLanguageProgress(profile, language.metadata.id, { namePracticeCompleted: false }); saveProfile(profile); continueToSelectedGame(); }; }
function renderGames() { const language = pack(); const text = ui(); const t = copy(); root.innerHTML = `${header()}<main class="screen"><section class="hero game-picker"><button class="back game-picker-back" data-action="languages">← ${text.back}</button><div class="eyebrow">${language.metadata.nativeName}</div><h1>${t.chooseGame}</h1><p>${t.gameIntro}</p><div class="game-grid">${games().map(game => `<button class="game-choice ${game.status !== 'ready' ? 'coming-soon' : ''}" data-game="${game.id}" ${game.status !== 'ready' ? 'disabled' : ''}><span class="game-choice-icon">${game.icon}</span><span><strong>${game.title}</strong><small>${game.description}</small></span>${game.status !== 'ready' ? `<em>${text.comingSoon}</em>` : '<span class="game-choice-arrow">→</span>'}</button>`).join('')}</div></section></main>`; root.querySelector('[data-action="languages"]').onclick = () => { view = 'languages'; render(); }; root.querySelectorAll('[data-game]').forEach(button => button.onclick = () => { profile.selectedGame = button.dataset.game; saveProfile(profile); continueToSelectedGame(); }); bindHeader(); }
function legacyRender2() { if (view === 'app-language') renderAppLanguage(); else if (view === 'auth') renderAuth(); else if (view === 'child-name') renderChildName(); else if (view === 'native-name') renderNativeName(); else if (view === 'languages') renderLanguages(); else if (view === 'games') renderGames(); else if (view === 'letters') renderLetters(); else if (view === 'tracing') renderTracing(); else if (view === 'game') renderGame(); else if (view === 'parent') renderParent(); else renderHome(); decorateWithMascot(); if (!root.querySelector('.release-tag')) root.insertAdjacentHTML('beforeend', `<span class="release-tag">v${RELEASE}</span>`); }

boot();

function renderTemplates() {
  const selected = profile.templateId || 'forest';
  const destination = returnView || (profile.selectedGame ? selectedGameView() : 'games');
  const labels = navCopy();
  root.innerHTML = `${header()}<main class="screen template-screen"><section class="hero"><button class="back" data-action="return">← ${labels.back}</button><div class="eyebrow">${labels.style}</div><h1>${labels.chooseStyle}</h1><p>${labels.styleIntro}</p><div class="template-grid">${templates.map(template => `<button class="template-card ${template.id === selected ? 'selected' : ''}" data-template-id="${template.id}">${template.image ? `<img src="${template.image}" alt="">` : '<span class="template-original">✨</span>'}<span class="template-card-body"><strong>${template.name}</strong><small>${template.description}</small></span>${template.id === selected ? '<b class="template-check">✓</b>' : ''}</button>`).join('')}</div></section></main>`;
  root.querySelector('[data-action="return"]').onclick = () => { view = destination; returnView = null; render(); };
  root.querySelectorAll('[data-template-id]').forEach(button => button.onclick = () => { profile.templateId = button.dataset.templateId; saveProfile(profile); applyTemplate(); render(); });
  bindHeader();
}

function render() { applyTemplate(); setDocumentLanguage(profile.appLanguage || 'nl'); if (view === 'app-language') renderAppLanguage(); else if (view === 'auth') renderAuth(); else if (view === 'adult-gate') renderAdultGate(); else if (view === 'delete-account') renderDeleteAccount(); else if (view === 'child-name') renderChildName(); else if (view === 'native-name') renderNativeName(); else if (view === 'languages') renderLanguages(); else if (view === 'games') renderGames(); else if (view === 'templates') renderTemplates(); else if (view === 'number-house-levels') renderNumberHouseLevels(); else if (view === 'number-houses') renderNumberHouses(); else if (view === 'letters') renderLetters(); else if (view === 'custom-tracing-input') renderCustomTracingInput(); else if (view === 'tracing') renderTracing(); else if (view === 'game') renderGame(); else if (view === 'parent') renderParent(); else renderHome(); decorateWithMascot(); if (!root.querySelector('[data-action="sound-toggle"]')) root.insertAdjacentHTML('beforeend', soundButton(true)); if (!root.querySelector('.release-tag')) root.insertAdjacentHTML('beforeend', `<span class="release-tag">v${RELEASE}</span>`); }

document.addEventListener('click', event => { const button = event.target.closest('[data-action="templates"]'); if (button) { returnView = view; view = 'templates'; render(); } });

document.addEventListener('click', event => { if (!event.target.closest('[data-action="sound-toggle"]')) return; profile.preferences = { ...(profile.preferences || {}), soundEnabled: !soundEnabled() }; saveProfile(profile); if (!soundEnabled()) stopAllAudio(); updateSoundButtons(); });

document.addEventListener('click', event => {
  const gameButton = event.target.closest('[data-game="number-houses"]');
  if (!gameButton) return;
  event.preventDefault();
  event.stopImmediatePropagation();
  profile.selectedGame = 'number-houses';
  saveProfile(profile);
  view = 'number-house-levels';
  render();
}, true);
