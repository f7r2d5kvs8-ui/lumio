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
