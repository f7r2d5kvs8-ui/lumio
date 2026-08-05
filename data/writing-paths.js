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
