// Reusable tracing templates. A letter is made from one or more ordered
// strokes, so languages can define different writing conventions later.
const box = '0 0 360 500';
const letter = strokes => ({ viewBox: box, strokes, startLabel: 'Begin', endLabel: 'Klaar' });

export const writingPaths = {
  'capital-a': letter(['M 65 420 L 180 75 L 295 420', 'M 110 290 H 250']),
  'capital-b': letter(['M 85 70 V 425', 'M 85 70 H 180 C 315 70 315 250 180 250 H 85', 'M 85 250 H 190 C 325 250 325 425 190 425 H 85']),
  'capital-c': letter(['M 285 115 C 225 55 90 75 75 245 C 65 415 225 455 290 385']),
  'capital-d': letter(['M 85 70 V 425', 'M 85 70 H 180 C 335 70 335 425 180 425 H 85']),
  'capital-e': letter(['M 290 85 H 85 V 420 H 290', 'M 85 250 H 245']),
  'capital-f': letter(['M 90 420 V 85 H 290', 'M 90 245 H 240']),
  'capital-g': letter(['M 290 125 C 220 55 80 75 75 245 C 70 425 230 445 295 365 V 265 H 195']),
  'capital-h': letter(['M 85 75 V 425', 'M 275 75 V 425', 'M 85 250 H 275']),
  'capital-i': letter(['M 100 75 H 260', 'M 180 75 V 425', 'M 100 425 H 260']),
  'capital-j': letter(['M 100 75 H 270', 'M 205 75 V 350 C 205 470 75 455 75 365']),
  'capital-k': letter(['M 85 75 V 425', 'M 280 75 L 85 255 L 285 425']),
  'capital-l': letter(['M 90 75 V 420 H 285']),
  'capital-m': letter(['M 70 425 V 80 L 180 260 L 290 80 V 425']),
  'capital-n': letter(['M 80 425 V 75 L 285 425 V 75']),
  'capital-o': letter(['M 180 65 C 55 65 55 435 180 435 C 305 435 305 65 215 70']),
  'capital-p': letter(['M 85 425 V 75 H 190 C 320 75 320 255 190 255 H 85']),
  'capital-q': letter(['M 170 65 C 45 65 45 435 170 435 C 295 435 295 65 205 70', 'M 215 330 L 305 425']),
  'capital-r': letter(['M 85 425 V 75 H 185 C 315 75 315 255 185 255 H 85', 'M 180 255 L 295 425']),
  'capital-s': letter(['M 275 105 C 220 45 105 55 85 130 C 60 220 280 220 280 325 C 280 440 110 455 70 375']),
  'capital-t': letter(['M 65 80 H 295', 'M 180 80 V 425']),
  'capital-u': letter(['M 80 75 V 330 C 80 470 280 470 280 330 V 75']),
  'capital-v': letter(['M 70 75 L 180 425 L 290 75']),
  'capital-w': letter(['M 45 75 L 115 425 L 180 235 L 245 425 L 315 75']),
  'capital-x': letter(['M 80 75 L 280 425', 'M 280 75 L 80 425']),
  'capital-y': letter(['M 70 75 L 180 255 L 290 75', 'M 180 255 V 425']),
  'capital-z': letter(['M 75 80 H 285 L 75 425 H 285'])
};

// Lowercase paths are deliberately separate from capital letters.  They use
// the same ordered-stroke format, so future refinements never change lessons.
Object.assign(writingPaths, {
  'lowercase-a': letter(['M 245 245 C 190 180 95 215 95 325 C 95 435 220 445 245 360 V 220', 'M 245 245 V 420']),
  'lowercase-b': letter(['M 95 70 V 420', 'M 95 265 C 180 175 285 235 285 330 C 285 430 175 450 95 370']),
  'lowercase-c': letter(['M 275 260 C 220 190 105 220 100 330 C 95 430 220 445 275 370']),
  'lowercase-d': letter(['M 265 70 V 420', 'M 265 265 C 180 175 75 235 75 330 C 75 430 185 450 265 370']),
  'lowercase-e': letter(['M 90 330 H 275 C 275 220 95 210 90 330 C 90 445 230 440 280 375']),
  'lowercase-f': letter(['M 235 75 C 140 55 135 175 135 420', 'M 75 245 H 245']),
  'lowercase-g': letter(['M 270 260 C 200 185 90 225 90 330 C 90 435 205 455 270 370 V 245', 'M 270 370 V 435 C 270 500 110 495 100 425']),
  'lowercase-h': letter(['M 95 70 V 420', 'M 95 275 C 190 185 265 235 265 330 V 420']),
  'lowercase-i': letter(['M 180 245 V 420', 'M 180 155 L 180 150']),
  'lowercase-j': letter(['M 205 245 V 405 C 205 490 90 485 90 420', 'M 205 155 L 205 150']),
  'lowercase-k': letter(['M 100 70 V 420', 'M 260 245 L 100 335 L 270 420']),
  'lowercase-l': letter(['M 180 70 V 420']),
  'lowercase-m': letter(['M 75 420 V 260 C 130 205 185 240 185 315 V 420', 'M 185 285 C 245 210 300 245 300 320 V 420']),
  'lowercase-n': letter(['M 90 420 V 250', 'M 90 280 C 175 195 270 240 270 335 V 420']),
  'lowercase-o': letter(['M 180 215 C 65 215 65 440 180 440 C 295 440 295 215 180 215']),
  'lowercase-p': letter(['M 95 250 V 480', 'M 95 275 C 175 190 285 240 285 335 C 285 435 180 455 95 375']),
  'lowercase-q': letter(['M 265 250 V 480', 'M 265 275 C 185 190 75 240 75 335 C 75 435 180 455 265 375']),
  'lowercase-r': letter(['M 100 420 V 250', 'M 100 285 C 145 225 215 230 250 260']),
  'lowercase-s': letter(['M 265 255 C 210 205 95 215 95 285 C 95 350 275 315 270 390 C 265 465 125 445 80 390']),
  'lowercase-t': letter(['M 180 120 V 375 C 180 445 245 435 270 400', 'M 105 245 H 245']),
  'lowercase-u': letter(['M 90 245 V 350 C 90 455 250 450 250 350 V 245', 'M 250 245 V 420']),
  'lowercase-v': letter(['M 85 245 L 180 420 L 275 245']),
  'lowercase-w': letter(['M 55 245 L 110 420 L 180 290 L 245 420 L 305 245']),
  'lowercase-x': letter(['M 95 250 L 270 420', 'M 270 250 L 95 420']),
  'lowercase-y': letter(['M 85 245 L 180 420 L 275 245', 'M 275 245 L 165 485']),
  'lowercase-z': letter(['M 90 250 H 275 L 90 420 H 275'])
});

// Connection anchors for composing whole Persian words. `incoming` is the
// red point where a letter accepts a connection from the letter on its right;
// `outgoing` is the green point where it can continue to the next letter on
// its left. Word composition aligns these anchors exactly and leaves a gap
// whenever the preceding Persian letter is non-joining.
const incoming = (x, y) => ({ incoming: { x, y } });
const joining = (incomingX, incomingY, outgoingX, outgoingY) => ({
  incoming: { x: incomingX, y: incomingY },
  outgoing: { x: outgoingX, y: outgoingY }
});
export const writingConnections = {
  'persian-alef-initial': incoming(195, 300),
  'persian-alef-isolated': incoming(195, 300),
  ...Object.fromEntries(['beh', 'peh', 'teh', 'theh'].flatMap(name => [
    [`persian-${name}-begin-middle`, joining(275, 325, 175, 325)],
    [`persian-${name}-end`, incoming(275, 325)]
  ])),
  ...Object.fromEntries(['jeem', 'cheh', 'hah', 'khah'].flatMap(name => [
    [`persian-${name}-begin-middle`, joining(295, 275, 70, 275)],
    [`persian-${name}-end`, incoming(295, 275)]
  ])),
  'persian-dal': incoming(245, 245),
  'persian-zal': incoming(245, 245),
  'persian-reh': incoming(245, 175),
  'persian-zain': incoming(245, 175),
  'persian-jeh': incoming(245, 175),
  ...Object.fromEntries(['seen', 'sheen'].flatMap(name => [
    [`persian-${name}-begin-middle`, joining(315, 270, 65, 270)],
    [`persian-${name}-end`, incoming(315, 270)]
  ])),
  ...Object.fromEntries(['sad', 'zad'].flatMap(name => [
    [`persian-${name}-begin-middle`, joining(315, 270, 65, 270)],
    [`persian-${name}-end`, incoming(315, 270)]
  ])),
  'persian-tah': joining(295, 300, 65, 300),
  'persian-zah': joining(295, 300, 65, 300),
  ...Object.fromEntries(['ain', 'ghain'].flatMap(name => [
    [`persian-${name}-begin-middle`, joining(285, 270, 75, 270)],
    [`persian-${name}-medial`, joining(315, 270, 75, 270)],
    [`persian-${name}-connected-end`, incoming(315, 270)],
    [`persian-${name}-end`, incoming(285, 270)]
  ])),
  ...Object.fromEntries(['feh', 'qaf'].flatMap(name => [
    [`persian-${name}-begin-middle`, joining(295, 270, 75, 270)],
    [`persian-${name}-end`, incoming(295, 270)]
  ])),
  ...Object.fromEntries(['kaf', 'gaf'].flatMap(name => [
    [`persian-${name}-begin-middle`, joining(210, 330, 145, 330)],
    [`persian-${name}-end`, incoming(210, 330)]
  ])),
  'persian-lam-begin-middle': joining(245, 330, 145, 330),
  'persian-lam-end': incoming(245, 315),
  'persian-meem-begin-middle': joining(285, 245, 75, 245),
  'persian-meem-end': incoming(285, 245),
  'persian-noon-begin-middle': joining(275, 300, 125, 300),
  'persian-noon-end': incoming(275, 270),
  'persian-waw': incoming(270, 220),
  'persian-heh-initial': joining(305, 245, 65, 245),
  'persian-heh-medial': joining(315, 250, 45, 250),
  'persian-heh-final': incoming(300, 300),
  'persian-yeh-begin-middle': joining(285, 250, 135, 250),
  'persian-yeh-final': incoming(280, 155)
};

// Persian paths always start on the right and travel to the left. These first
// child-writing templates deliberately use simple strokes rather than
// typographic calligraphy.
const persianMeemLoop = 'M 285 245 C 315 275 290 315 250 305 C 210 295 220 245 255 238 C 268 235 278 238 285 245 Z';
Object.assign(writingPaths, {
  // مـ — the small hanging loop followed by its left-facing connection.
  'persian-meem-begin-middle': letter([
    persianMeemLoop,
    'M 255 245 H 75'
  ]),
  // ـم — the same loop, then a horizontal bridge and long downward ending.
  'persian-meem-end': letter([
    persianMeemLoop,
    'M 255 245 H 105 V 410'
  ])
});

// The ب، پ، ت، ث family follows the child's squared two-form reference:
// a beginning/middle form with joining tails and a separate ending form.
// A dot is rendered as a short stroked mark. The tracing engine treats this
// as a tap-sized step, so children only need to tap the dot instead of trace
// a tiny circle.
const persianDot = (x, y) => `M ${x} ${y} H ${x + 1}`;
// A tooth is always one child-writing grid unit high. Keep this shared value
// separate from tall bars/handles (for example ط، ظ، ل and ک).
const persianToothHeight = 80;
const persianBehRight = 275;
const persianBehBeginningLength = 100;
const persianBehEndingLength = persianBehBeginningLength * 2;
const persianBehBeginningLeft = persianBehRight - persianBehBeginningLength;
const persianBehEndingLeft = persianBehRight - persianBehEndingLength;
const persianBehShapes = {
  // Beginning/middle is only the right half of the ending shape. It has no
  // extra starting tail: children begin at the top of the vertical stroke.
  'begin-middle': [`M ${persianBehRight} ${325 - persianToothHeight} V 325 H ${persianBehBeginningLeft}`],
  end: [`M ${persianBehRight} ${325 - persianToothHeight} V 325 H ${persianBehEndingLeft} V ${325 - persianToothHeight}`]
};
const makePersianDotFamily = (name, dotsByForm) => Object.fromEntries(Object.entries(persianBehShapes).map(([form, strokes]) => [
  `persian-${name}-${form}`,
  letter([...strokes, ...dotsByForm[form].map(([x, y]) => persianDot(x, y))])
]));

// The ج، چ، ح، خ family shares one child-writing skeleton. The short upper
// diagonal and longer lower diagonal meet at the right edge. Beginning/middle
// forms use a straight horizontal baseline; ending forms use an open semicircle.
const persianJeemShapes = {
  'begin-middle': [
    'M 215 220 L 238 185 L 295 275',
    'M 295 275 H 70'
  ],
  end: [
    'M 215 220 L 238 185 L 295 275',
    'M 295 275 C 175 275 150 430 295 430'
  ]
};
const makePersianJeemFamily = (name, dotsByForm) => Object.fromEntries(Object.entries(persianJeemShapes).map(([form, strokes]) => [
  `persian-${name}-${form}`,
  letter([...strokes, ...dotsByForm[form].map(([x, y]) => persianDot(x, y))])
]));

// د، ذ use two straight angled strokes. ر، ز، ژ use one simple descending
// curve. These non-joining letters each have one child-writing form.
const persianDalShape = ['M 150 165 L 245 245 L 150 325'];
const persianRehShape = ['M 245 175 C 245 260 210 320 145 345'];

// س، ش: three child-friendly teeth. The beginning/middle form finishes with
// a horizontal connection; the ending form opens into a large lower bowl.
const persianSeenShapes = {
  'begin-middle': [
    'M 315 270 H 65',
    `M 315 ${270 - persianToothHeight} V 270`,
    `M 255 ${270 - persianToothHeight} V 270`,
    `M 195 ${270 - persianToothHeight} V 270`
  ],
  end: [
    'M 315 270 H 195 C 195 420 55 420 55 270',
    `M 315 ${270 - persianToothHeight} V 270`,
    `M 255 ${270 - persianToothHeight} V 270`,
    `M 195 ${270 - persianToothHeight} V 270`
  ]
};

// ص، ض: the small upper semicircle is closed by its horizontal baseline and
// has a separate tooth on its left. The ending form leaves a short space
// between this closed bowl and the large lower bowl.
const persianSadShapes = {
  'begin-middle': [
    'M 315 270 H 65',
    'M 315 270 C 315 190 235 190 225 270',
    `M 180 ${270 - persianToothHeight} V 270`
  ],
  end: [
    'M 315 270 H 145 C 145 420 45 420 45 270',
    'M 315 270 C 315 190 235 190 225 270',
    `M 145 ${270 - persianToothHeight} V 270`
  ]
};

// ع، غ have four contextual forms. The medial and connected-ending forms use
// the closed triangular body from the handwriting reference.
const persianAinShapes = {
  'begin-middle': [
    'M 285 180 C 220 180 220 270 285 270',
    'M 285 270 H 75'
  ],
  medial: [
    'M 315 270 H 75',
    'M 285 190 H 185 L 235 270 Z'
  ],
  'connected-end': [
    'M 315 270 H 235',
    'M 285 190 H 185 L 235 270 Z',
    'M 235 270 C 105 270 105 430 285 430'
  ],
  end: [
    'M 285 180 C 220 180 220 270 285 270',
    'M 285 270 C 145 270 135 430 285 430'
  ]
};

// ف، ق share a small closed upper loop. Their beginning/middle form has a
// straight left tail; ف ends with a raised tip and ق with a large lower bowl.
const persianFehLoop = 'M 295 270 C 295 205 225 205 225 270 H 295';
const persianFehBeginning = [persianFehLoop, 'M 225 270 H 75'];
const persianFehEnding = [persianFehLoop, 'M 225 270 H 75 C 55 270 45 250 45 220'];
const persianQafEnding = [persianFehLoop, 'M 295 270 C 295 420 65 420 65 270'];

// ک، گ: diagonal upper stroke, straight vertical, and a short or long base.
// گ adds its small parallel upper mark as a separate final fragment.
const persianKafShapes = {
  'begin-middle': ['M 300 120 L 210 210 V 330 H 145'],
  end: ['M 300 120 L 210 210 V 330 H 80 C 60 330 50 310 50 280']
};
const persianGafMark = 'M 235 135 L 275 95';

const makeTwoFormFamily = (name, shapes, dotsByForm) => Object.fromEntries(Object.entries(shapes).map(([form, strokes]) => [
  `persian-${name}-${form}`,
  letter([...strokes, ...dotsByForm[form].map(([x, y]) => persianDot(x, y))])
]));
Object.assign(writingPaths, {
  // ا forms based on the child-writing reference: beginning hook, isolated
  // middle, and a right-joining middle/ending form.
  'persian-alef-initial': letter(['M 245 90 V 115 H 145 V 150', 'M 195 165 V 300']),
  'persian-alef-isolated': letter(['M 195 90 V 300']),
  // Beginning/middle dots sit directly below or above the centre of their
  // shorter horizontal stroke. Ending dots retain their verified positions.
  ...makePersianDotFamily('beh', {
    'begin-middle': [[225, 390]], end: [[175, 390]]
  }),
  ...makePersianDotFamily('peh', {
    'begin-middle': [[207, 390], [243, 390], [225, 414]],
    end: [[157, 390], [193, 390], [175, 414]]
  }),
  ...makePersianDotFamily('teh', {
    'begin-middle': [[207, 130], [243, 130]], end: [[157, 130], [193, 130]]
  }),
  ...makePersianDotFamily('theh', {
    'begin-middle': [[195, 135], [225, 115], [255, 135]],
    end: [[145, 135], [175, 115], [205, 135]]
  }),
  ...makePersianJeemFamily('jeem', {
    'begin-middle': [[270, 335]], end: [[270, 345]]
  }),
  ...makePersianJeemFamily('cheh', {
    'begin-middle': [[252, 335], [288, 335], [270, 365]],
    end: [[252, 335], [288, 335], [270, 365]]
  }),
  ...makePersianJeemFamily('hah', {
    'begin-middle': [], end: []
  }),
  ...makePersianJeemFamily('khah', {
    'begin-middle': [[240, 125]], end: [[240, 125]]
  }),
  'persian-dal': letter(persianDalShape),
  'persian-zal': letter([...persianDalShape, persianDot(150, 95)]),
  'persian-reh': letter(persianRehShape),
  'persian-zain': letter([...persianRehShape, persianDot(245, 105)]),
  'persian-jeh': letter([
    ...persianRehShape,
    persianDot(227, 105), persianDot(263, 105), persianDot(245, 75)
  ]),
  ...makeTwoFormFamily('seen', persianSeenShapes, {
    'begin-middle': [], end: []
  }),
  ...makeTwoFormFamily('sheen', persianSeenShapes, {
    'begin-middle': [[227, 155], [263, 155], [245, 125]],
    end: [[227, 155], [263, 155], [245, 125]]
  }),
  ...makeTwoFormFamily('sad', persianSadShapes, {
    'begin-middle': [], end: []
  }),
  ...makeTwoFormFamily('zad', persianSadShapes, {
    'begin-middle': [[245, 125]], end: [[245, 125]]
  }),
  'persian-tah': letter([
    'M 295 300 C 295 215 205 215 195 300 H 295',
    'M 195 300 H 65',
    'M 195 90 V 300'
  ]),
  'persian-zah': letter([
    'M 295 300 C 295 215 205 215 195 300 H 295',
    'M 195 300 H 65',
    'M 195 90 V 300',
    persianDot(250, 155)
  ]),
  ...makeTwoFormFamily('ain', persianAinShapes, {
    'begin-middle': [], medial: [], 'connected-end': [], end: []
  }),
  ...makeTwoFormFamily('ghain', persianAinShapes, {
    'begin-middle': [[250, 115]], medial: [[235, 125]],
    'connected-end': [[235, 125]], end: [[250, 115]]
  }),
  'persian-feh-begin-middle': letter([...persianFehBeginning, persianDot(260, 140)]),
  'persian-feh-end': letter([...persianFehEnding, persianDot(260, 140)]),
  'persian-qaf-begin-middle': letter([
    ...persianFehBeginning, persianDot(242, 140), persianDot(278, 140)
  ]),
  'persian-qaf-end': letter([
    ...persianQafEnding, persianDot(242, 140), persianDot(278, 140)
  ]),
  'persian-kaf-begin-middle': letter(persianKafShapes['begin-middle']),
  'persian-kaf-end': letter(persianKafShapes.end),
  'persian-gaf-begin-middle': letter([...persianKafShapes['begin-middle'], persianGafMark]),
  'persian-gaf-end': letter([...persianKafShapes.end, persianGafMark]),
  'persian-lam-begin-middle': letter(['M 245 100 V 330 H 145']),
  'persian-lam-end': letter(['M 245 100 V 315 C 245 420 85 420 85 315']),
  'persian-noon-begin-middle': letter([
    `M 275 ${300 - persianToothHeight} V 300 H 125`,
    persianDot(200, 85)
  ]),
  'persian-noon-end': letter([
    'M 275 270 C 275 420 75 420 75 270',
    persianDot(175, 220)
  ]),
  'persian-waw': letter([
    'M 265 185 C 295 215 270 270 225 255 C 190 243 195 195 230 180 C 245 175 258 178 265 185 Z',
    'M 270 220 C 275 290 235 350 175 380'
  ]),
  'persian-heh-initial': letter([
    'M 205 145 L 305 245 H 215 Q 195 245 190 225 C 205 205 235 175 250 190 C 260 200 278 218 275 232 C 272 245 240 250 215 245 H 65'
  ]),
  'persian-heh-medial': letter([
    'M 315 250 H 225 L 180 350 L 135 250 H 45'
  ]),
  'persian-heh-final': letter([
    'M 220 180 C 155 160 150 245 220 245 Z',
    'M 220 180 V 300 H 300'
  ]),
  'persian-yeh-begin-middle': letter([
    `M 285 ${250 - persianToothHeight} V 250 H 135`,
    persianDot(205, 305),
    persianDot(255, 305)
  ]),
  'persian-yeh-final': letter([
    'M 280 155 C 235 160 215 205 250 235 C 290 270 270 335 220 370 C 165 405 80 390 65 320 C 58 280 75 245 100 220'
  ])
});
