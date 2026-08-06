const dutchWords = [
  ['aap', '🐒'], ['bal', '⚽'], ['bed', '🛏️'], ['bij', '🐝'], ['bok', '🐐'], ['bus', '🚌'], ['dak', '🏠'], ['das', '🦡'], ['ei', '🥚'], ['kat', '🐱'],
  ['kip', '🐔'], ['koe', '🐄'], ['lam', '🐑'], ['map', '🗺️'], ['mes', '🔪'], ['mus', '🐦'], ['pan', '🍳'], ['pen', '🖊️'], ['pet', '🧢'], ['pop', '🪆'],
  ['rat', '🐀'], ['rek', '🗄️'], ['sok', '🧦'], ['tas', '👜'], ['vis', '🐟'], ['voet', '🦶'], ['vork', '🍴'], ['wiel', '🛞'], ['wind', '💨'], ['zon', '☀️'],
  ['boom', '🌳'], ['doos', '📦'], ['eend', '🦆'], ['fles', '🍼'], ['geit', '🐐'], ['gras', '🌱'], ['hand', '✋'], ['huis', '🏠'], ['kaas', '🧀'], ['klok', '🕐'],
  ['maan', '🌙'], ['noot', '🥜'], ['paard', '🐴'], ['roos', '🌹'], ['schaap', '🐑'], ['spel', '🎲'], ['ster', '⭐'], ['stoel', '🪑'], ['tent', '⛺'], ['uil', '🦉'],
  ['vacht', '🐕'], ['vlag', '🚩'], ['wolk', '☁️'], ['worm', '🪱'], ['zaag', '🪚'], ['zeep', '🧼'], ['bloem', '🌸'], ['brood', '🍞'], ['kikker', '🐸'], ['regen', '🌧️']
];

function words(start, end) { return dutchWords.slice(start, end).map(([word, emoji]) => ({ word, emoji })); }

const englishWords = [
  ['cat','🐱'],['dog','🐶'],['sun','☀️'],['hat','🎩'],['pen','🖊️'],['bed','🛏️'],['bus','🚌'],['cup','🥤'],['fish','🐟'],['frog','🐸'],
  ['tree','🌳'],['moon','🌙'],['star','⭐'],['book','📘'],['ball','⚽'],['cake','🍰'],['milk','🥛'],['hand','✋'],['duck','🦆'],['boat','⛵'],
  ['apple','🍎'],['banana','🍌'],['rabbit','🐰'],['tiger','🐯'],['house','🏠'],['chair','🪑'],['spoon','🥄'],['cloud','☁️'],['green','🟢'],['train','🚂'],
  ['water','💧'],['flower','🌸'],['yellow','🟡'],['purple','🟣'],['garden','🌻'],['little','🐞'],['cookie','🍪'],['monkey','🐒'],['pencil','✏️'],['window','🪟'],
  ['school','🏫'],['friend','🧑‍🤝‍🧑'],['orange','🍊'],['winter','❄️'],['summer','🏖️'],['rocket','🚀'],['butterfly','🦋'],['rainbow','🌈'],['sandwich','🥪'],['elephant','🐘'],
  ['dinosaur','🦕'],['birthday','🎂'],['playground','🛝'],['computer','💻'],['umbrella','☂️'],['adventure','🗺️'],['treasure','💎'],['princess','👑'],['unicorn','🦄'],['wonderful','✨']
];
function englishLessonWords(start, end) { return englishWords.slice(start, end).map(([word, emoji]) => ({ word, emoji })); }

const persianWords = [
  ['آب', '💧'], ['بابا', '👨'], ['مامان', '👩'], ['سیب', '🍎'], ['نان', '🍞'], ['گل', '🌷'], ['ماه', '🌙'], ['موش', '🐭'], ['در', '🚪'], ['کتاب', '📘'],
  ['مداد', '✏️'], ['مدرسه', '🏫'], ['خانه', '🏠'], ['دست', '✋'], ['پا', '🦶'], ['گربه', '🐱'], ['سگ', '🐶'], ['ببر', '🐯'], ['باران', '🌧️'], ['ابر', '☁️'],
  ['خورشید', '☀️'], ['ستاره', '⭐'], ['دوست', '🧑‍🤝‍🧑'], ['باغ', '🌳'], ['پرنده', '🐦'], ['ماهی', '🐟'], ['درخت', '🌲'], ['پنجره', '🪟'], ['کفش', '👟'], ['لباس', '👕'],
  ['اتوبوس', '🚌'], ['قطار', '🚆'], ['دوچرخه', '🚲'], ['بازی', '🎲'], ['توپ', '⚽'], ['رنگ', '🎨'], ['موسیقی', '🎵'], ['عروسک', '🧸'], ['پروانه', '🦋'], ['رنگین‌کمان', '🌈'],
  ['هواپیما', '✈️'], ['بستنی', '🍦'], ['شیر', '🥛'], ['پرتقال', '🍊'], ['موز', '🍌'], ['کیک', '🍰'], ['دریا', '🌊'], ['کوه', '⛰️'], ['زمستان', '❄️'], ['تابستان', '☀️'],
  ['ماجراجویی', '🗺️'], ['کامپیوتر', '💻'], ['تلفن', '☎️'], ['هدیه', '🎁'], ['تولد', '🎂'], ['دیناسور', '🦕'], ['ربات', '🤖'], ['شاهزاده', '👑'], ['گنج', '💎'], ['شاد', '✨']
];
function persianLessonWords(start, end) { return persianWords.slice(start, end).map(([word, emoji]) => ({ word, emoji })); }

export const languageCatalog = [
  { id: 'nl', name: 'Nederlands', nativeName: 'Nederlands', flag: '🇳🇱 🇧🇪', flagCodes: ['nl', 'be'], locale: 'nl-NL', status: 'ready' },
  { id: 'en', name: 'Engels', nativeName: 'English', flag: '🇬🇧', flagCodes: ['gb'], icon: '🦊', locale: 'en-GB', status: 'ready' },
  { id: 'de', name: 'Duits', nativeName: 'Deutsch', flag: '🇩🇪', flagCodes: ['de'], icon: '🐻', locale: 'de-DE', status: 'comingSoon' },
  { id: 'fr', name: 'Frans', nativeName: 'Français', flag: '🇫🇷', flagCodes: ['fr'], icon: '🦋', locale: 'fr-FR', status: 'comingSoon' },
  { id: 'es', name: 'Spaans', nativeName: 'Español', flag: '🇪🇸', flagCodes: ['es'], icon: '🌞', locale: 'es-ES', status: 'comingSoon' },
  { id: 'fa', name: 'Perzisch', nativeName: 'فارسی', flag: '🇮🇷', flagCodes: ['ir'], icon: '🪷', locale: 'fa-IR', status: 'ready' },
  { id: 'ar', name: 'Arabisch', nativeName: 'العربية', flag: '🇸🇦', flagCodes: ['sa'], icon: '🌙', locale: 'ar', status: 'comingSoon' }
];

export const languagePackages = {
  nl: {
    metadata: languageCatalog[0],
    alphabet: ['a', 'e', 'i', 'o', 'u', 'm', 's', 't', 'p', 'n', 'k', 'l', 'b', 'd', 'v', 'r', 'g', 'h', 'w', 'z'],
    phonics: { a: 'aa', e: 'uh', i: 'ie', o: 'oo', u: 'uu', m: 'mmm', s: 'sss', t: 'tuh', p: 'puh', n: 'nnn', k: 'kuh', l: 'lll' },
    writingRules: { direction: 'ltr', joining: false, case: 'lowercase-first' },
    ui: {
      begin: 'Start', listen: 'Luister', hint: 'Hint', check: '👀 Kijk na', next: 'Volgende', back: 'Terug', great: 'Goed gedaan!', tryAgain: 'Probeer opnieuw', chooseLanguage: 'Kies een taal',
      chooseWorld: 'Kies jouw leerwereld', languageIntro: 'Druk op de luidspreker om een taal te horen.', comingSoon: 'Binnenkort',
      hello: 'Hallo, leerheld!', dailyIntro: 'Vandaag oefenen we met luisteren, klanken en woorden.', daily: 'Dagelijkse oefening', growth: 'Jouw groei', worlds: 'werelden',
      sounds: 'Letters en klanken', building: 'Luisteren en woorden bouwen', locked: 'Nog even oefenen', build: 'Bouw het woord', find: 'Zoek de letters van dit woord',
      gameIntro: 'Luister goed en kies de letters.', listenPrompt: 'Luister:', restart: 'Even opnieuw proberen in deze wereld.', parents: 'Voor ouders', parentTitle: 'Rustige groei, stap voor stap',
      worldsDone: 'werelden af', days: 'dagen op rij', stars: 'sterren verdiend', homeLanguage: 'Thuistaal', adSetting: 'Leeradvertentie tonen', on: 'Aan', savedNote: 'Voortgang wordt veilig op dit apparaat bewaard.', ad: 'Advertentie', adMessage: 'Lumio blijft gratis voor gezinnen'
    },
    games: [
      { id: 'word-builder', title: 'Woordbouwers', description: 'Luister, kies letters en bouw woorden.', icon: '🧩', status: 'ready' },
      { id: 'letter-trail', title: 'Letterspoor', description: 'Luister naar een klank en volg het letterspoor.', icon: '✍️', status: 'ready' }
    ],
    writing: [
      ['A', 'aa'], ['B', 'buh'], ['C', 'suh'], ['D', 'duh'], ['E', 'ee'], ['F', 'fuh'], ['G', 'guh'], ['H', 'huh'], ['I', 'ie'], ['J', 'yuh'], ['K', 'kuh'], ['L', 'luh'], ['M', 'muh'],
      ['N', 'nuh'], ['O', 'oo'], ['P', 'puh'], ['Q', 'kuu'], ['R', 'ruh'], ['S', 'ssss'], ['T', 'tuh'], ['U', 'uu'], ['V', 'vuh'], ['W', 'wuh'], ['X', 'iks'], ['Y', 'ie'], ['Z', 'zuh']
    ].map(([letter, phoneme]) => ({ id: `letter-${letter.toLowerCase()}`, letter, lowercase: letter.toLowerCase(), phoneme, forms: [
      { id: `capital-${letter.toLowerCase()}`, label: 'hoofdletter', pathId: `capital-${letter.toLowerCase()}` },
      { id: `lowercase-${letter.toLowerCase()}`, label: 'kleine letter', pathId: `lowercase-${letter.toLowerCase()}` }
    ], title: `De letter ${letter}` })),
    curriculum: [
      { id: 'sounds-1', title: 'Eerste klanken', icon: '🔤', skill: 'letter', words: words(0, 10) },
      { id: 'sounds-2', title: 'Klanken mengen', icon: '🎵', skill: 'build', words: words(10, 20) },
      { id: 'words-1', title: 'Korte woorden', icon: '🧩', skill: 'build', words: words(20, 30) },
      { id: 'words-2', title: 'Meer woorden', icon: '🚲', skill: 'build', words: words(30, 40) },
      { id: 'words-3', title: 'Lange klanken', icon: '🌈', skill: 'build', words: words(40, 50) },
      { id: 'words-4', title: 'Leesheld', icon: '🏆', skill: 'build', words: words(50, 60) }
    ]
  },
  en: {
    metadata: languageCatalog[1],
    alphabet: ['a','e','i','o','u','m','s','t','p','n','k','l','b','d','v','r','g','h','w','z'],
    phonics: { a: 'a', e: 'e', i: 'i', o: 'o', u: 'u', m: 'mmm', s: 'sss', t: 'tuh', p: 'puh', n: 'nnn', k: 'kuh', l: 'lll' },
    writingRules: { direction: 'ltr', joining: false, case: 'uppercase-lowercase' },
    ui: {
      begin: 'Start', listen: 'Listen', hint: 'Hint', check: '👀 Check', next: 'Next', back: 'Back', great: 'Great job!', tryAgain: 'Try again', chooseLanguage: 'Choose a language',
      chooseWorld: 'Choose your learning world', languageIntro: 'Press the speaker to hear a language.', comingSoon: 'Coming soon',
      hello: 'Hello, learning hero!', dailyIntro: 'Today we practise listening, sounds and words.', daily: 'Daily practice', growth: 'Your growth', worlds: 'worlds',
      sounds: 'Letters and sounds', building: 'Listening and building words', locked: 'Keep practising', build: 'Build the word', find: 'Find the letters in this word',
      gameIntro: 'Listen carefully and choose the letters.', listenPrompt: 'Listen:', restart: 'Try this world again.', parents: 'For parents', parentTitle: 'Calm growth, one step at a time',
      worldsDone: 'worlds finished', days: 'days in a row', stars: 'stars earned', homeLanguage: 'Home language', adSetting: 'Show learning advert', on: 'On', savedNote: 'Progress is safely saved on this device.', ad: 'Advertisement', adMessage: 'Lumio stays free for families'
    },
    games: [
      { id: 'word-builder', title: 'Word Builders', description: 'Listen, choose letters and build words.', icon: '🧩', status: 'ready' },
      { id: 'letter-trail', title: 'Letter Trail', description: 'Listen to a sound and follow the letter trail.', icon: '✍️', status: 'ready' }
    ],
    writing: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => ({ id: `letter-${letter.toLowerCase()}`, letter, lowercase: letter.toLowerCase(), phoneme: letter, forms: [
      { id: `capital-${letter.toLowerCase()}`, label: 'uppercase letter', pathId: `capital-${letter.toLowerCase()}` },
      { id: `lowercase-${letter.toLowerCase()}`, label: 'lowercase letter', pathId: `lowercase-${letter.toLowerCase()}` }
    ], title: `The letter ${letter}` })),
    curriculum: [
      { id: 'sounds-1', title: 'First sounds', icon: '🔤', skill: 'letter', words: englishLessonWords(0, 10) },
      { id: 'sounds-2', title: 'Blend sounds', icon: '🎵', skill: 'build', words: englishLessonWords(10, 20) },
      { id: 'words-1', title: 'Short words', icon: '🧩', skill: 'build', words: englishLessonWords(20, 30) },
      { id: 'words-2', title: 'More words', icon: '🚲', skill: 'build', words: englishLessonWords(30, 40) },
      { id: 'words-3', title: 'Longer words', icon: '🌈', skill: 'build', words: englishLessonWords(40, 50) },
      { id: 'words-4', title: 'Reading hero', icon: '🏆', skill: 'build', words: englishLessonWords(50, 60) }
    ]
  },
  fa: {
    metadata: languageCatalog[5],
    alphabet: ['ا','آ','ب','پ','ت','ث','ج','چ','ح','خ','د','ذ','ر','ز','ژ','س','ش','ص','ض','ط','ظ','ع','غ','ف','ق','ک','گ','ل','م','ن','و','ه','ی'],
    phonics: { ا:'ا', آ:'آ', ب:'ب', پ:'پ', ت:'ت', ج:'ج', چ:'چ', د:'د', ر:'ر', س:'س', ش:'ش', ک:'ک', گ:'گ', ل:'ل', م:'م', ن:'ن', و:'و', ه:'ه', ی:'ی' },
    writingRules: { direction: 'rtl', joining: true, case: 'single-form', script: 'arabic' },
    ui: {
      begin: 'شروع', listen: 'گوش کن', hint: 'راهنما', check: 'بررسی', next: 'بعدی', back: 'بازگشت', great: 'آفرین!', tryAgain: 'دوباره تلاش کن', chooseLanguage: 'یک زبان انتخاب کن',
      chooseWorld: 'دنیای یادگیری‌ات را انتخاب کن', languageIntro: 'برای شنیدن زبان، روی بلندگو بزن.', comingSoon: 'به‌زودی',
      hello: 'سلام، قهرمان یادگیری!', dailyIntro: 'امروز با صداها و واژه‌ها تمرین می‌کنیم.', daily: 'تمرین روزانه', growth: 'رشد تو', worlds: 'مرحله',
      sounds: 'حروف و صداها', building: 'گوش دادن و ساختن واژه', locked: 'کمی بیشتر تمرین کن', build: 'واژه را بساز', find: 'حروف این واژه را پیدا کن',
      gameIntro: 'با دقت گوش کن و حروف را انتخاب کن.', listenPrompt: 'گوش کن:', restart: 'این مرحله را دوباره تمرین کن.', parents: 'برای والدین', parentTitle: 'رشد آرام، قدم به قدم',
      worldsDone: 'مرحله تمام شده', days: 'روز پیاپی', stars: 'ستاره گرفته', homeLanguage: 'زبان خانه', adSetting: 'نمایش تبلیغ آموزشی', on: 'روشن', savedNote: 'پیشرفت با امنیت روی این دستگاه ذخیره می‌شود.', ad: 'تبلیغ', adMessage: 'لومیو برای خانواده‌ها رایگان می‌ماند'
    },
    games: [
      { id: 'word-builder', title: 'واژه‌ساز', description: 'گوش کن، حروف را انتخاب کن و واژه بساز.', icon: '🧩', status: 'ready' },
      { id: 'letter-trail', title: 'مسیر حرف', description: 'صدای حرف را بشنو و شکل‌های آن را دنبال کن.', icon: '✍️', status: 'ready' }
    ],
    writing: [
      {
        id: 'letter-meem', letter: 'م', lowercase: 'ابتدا · میان · پایانِ جدا · پایانِ چسبیده', phoneme: 'م', title: 'حرف م',
        forms: [
          { id: 'persian-meem-initial', label: 'شکل آغاز', pathId: 'persian-meem-initial' },
          { id: 'persian-meem-medial', label: 'شکل میانی', pathId: 'persian-meem-medial' },
          { id: 'persian-meem-isolated', label: 'شکل پایانیِ جدا', pathId: 'persian-meem-isolated' },
          { id: 'persian-meem-final', label: 'شکل پایانیِ چسبیده', pathId: 'persian-meem-final' }
        ]
      },
      {
        id: 'letter-alef', letter: 'ا', lowercase: 'آغاز · میانیِ جدا · میانی/پایانیِ چسبیده', phoneme: 'ا', title: 'حرف ا',
        forms: [
          { id: 'persian-alef-initial', label: 'شکل آغاز', pathId: 'persian-alef-initial' },
          { id: 'persian-alef-isolated', label: 'شکل میانیِ جدا', pathId: 'persian-alef-isolated' },
          { id: 'persian-alef-final', label: 'شکل میانی/پایانیِ چسبیده', pathId: 'persian-alef-final' }
        ]
      },
      {
        id: 'letter-beh', letter: 'ب', lowercase: 'آغاز یا میانی · پایانی', phoneme: 'ب', title: 'حرف ب',
        forms: [
          { id: 'persian-beh-begin-middle', label: 'شکل آغاز یا میانی', pathId: 'persian-beh-begin-middle' },
          { id: 'persian-beh-end', label: 'شکل پایانی', pathId: 'persian-beh-end' }
        ]
      },
      {
        id: 'letter-peh', letter: 'پ', lowercase: 'آغاز یا میانی · پایانی', phoneme: 'پ', title: 'حرف پ',
        forms: [
          { id: 'persian-peh-begin-middle', label: 'شکل آغاز یا میانی', pathId: 'persian-peh-begin-middle' },
          { id: 'persian-peh-end', label: 'شکل پایانی', pathId: 'persian-peh-end' }
        ]
      },
      {
        id: 'letter-teh', letter: 'ت', lowercase: 'آغاز یا میانی · پایانی', phoneme: 'ت', title: 'حرف ت',
        forms: [
          { id: 'persian-teh-begin-middle', label: 'شکل آغاز یا میانی', pathId: 'persian-teh-begin-middle' },
          { id: 'persian-teh-end', label: 'شکل پایانی', pathId: 'persian-teh-end' }
        ]
      },
      {
        id: 'letter-theh', letter: 'ث', lowercase: 'آغاز یا میانی · پایانی', phoneme: 'ث', title: 'حرف ث',
        forms: [
          { id: 'persian-theh-begin-middle', label: 'شکل آغاز یا میانی', pathId: 'persian-theh-begin-middle' },
          { id: 'persian-theh-end', label: 'شکل پایانی', pathId: 'persian-theh-end' }
        ]
      }
    ],
    curriculum: [
      { id: 'sounds-1', title: 'صداهای نخست', icon: '🔤', skill: 'letter', words: persianLessonWords(0, 10) },
      { id: 'sounds-2', title: 'ترکیب صداها', icon: '🎵', skill: 'build', words: persianLessonWords(10, 20) },
      { id: 'words-1', title: 'واژه‌های کوتاه', icon: '🧩', skill: 'build', words: persianLessonWords(20, 30) },
      { id: 'words-2', title: 'واژه‌های بیشتر', icon: '🚲', skill: 'build', words: persianLessonWords(30, 40) },
      { id: 'words-3', title: 'واژه‌های بلندتر', icon: '🌈', skill: 'build', words: persianLessonWords(40, 50) },
      { id: 'words-4', title: 'قهرمان خواندن', icon: '🏆', skill: 'build', words: persianLessonWords(50, 60) }
    ]
  }
};
