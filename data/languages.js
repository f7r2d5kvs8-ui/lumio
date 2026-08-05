const dutchWords = [
  ['aap', '🐒'], ['bal', '⚽'], ['bed', '🛏️'], ['bij', '🐝'], ['bok', '🐐'], ['bus', '🚌'], ['dak', '🏠'], ['das', '🦡'], ['ei', '🥚'], ['kat', '🐱'],
  ['kip', '🐔'], ['koe', '🐄'], ['lam', '🐑'], ['map', '🗺️'], ['mes', '🔪'], ['mus', '🐦'], ['pan', '🍳'], ['pen', '🖊️'], ['pet', '🧢'], ['pop', '🪆'],
  ['rat', '🐀'], ['rek', '🗄️'], ['sok', '🧦'], ['tas', '👜'], ['vis', '🐟'], ['voet', '🦶'], ['vork', '🍴'], ['wiel', '🛞'], ['wind', '💨'], ['zon', '☀️'],
  ['boom', '🌳'], ['doos', '📦'], ['eend', '🦆'], ['fles', '🍼'], ['geit', '🐐'], ['gras', '🌱'], ['hand', '✋'], ['huis', '🏠'], ['kaas', '🧀'], ['klok', '🕐'],
  ['maan', '🌙'], ['noot', '🥜'], ['paard', '🐴'], ['roos', '🌹'], ['schaap', '🐑'], ['spel', '🎲'], ['ster', '⭐'], ['stoel', '🪑'], ['tent', '⛺'], ['uil', '🦉'],
  ['vacht', '🐕'], ['vlag', '🚩'], ['wolk', '☁️'], ['worm', '🪱'], ['zaag', '🪚'], ['zeep', '🧼'], ['bloem', '🌸'], ['brood', '🍞'], ['kikker', '🐸'], ['regen', '🌧️']
];

function words(start, end) { return dutchWords.slice(start, end).map(([word, emoji]) => ({ word, emoji })); }

export const languageCatalog = [
  { id: 'nl', name: 'Nederlands', nativeName: 'Nederlands', flag: '🇳🇱 🇧🇪', flagCodes: ['nl', 'be'], locale: 'nl-NL', status: 'ready' },
  { id: 'en', name: 'Engels', nativeName: 'English', flag: '🇬🇧', flagCodes: ['gb'], icon: '🦊', locale: 'en-GB', status: 'comingSoon' },
  { id: 'de', name: 'Duits', nativeName: 'Deutsch', flag: '🇩🇪', flagCodes: ['de'], icon: '🐻', locale: 'de-DE', status: 'comingSoon' },
  { id: 'fr', name: 'Frans', nativeName: 'Français', flag: '🇫🇷', flagCodes: ['fr'], icon: '🦋', locale: 'fr-FR', status: 'comingSoon' },
  { id: 'es', name: 'Spaans', nativeName: 'Español', flag: '🇪🇸', flagCodes: ['es'], icon: '🌞', locale: 'es-ES', status: 'comingSoon' },
  { id: 'fa', name: 'Perzisch', nativeName: 'فارسی', flag: '🇮🇷', flagCodes: ['ir'], icon: '🪷', locale: 'fa-IR', status: 'comingSoon' },
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
  }
};
