const latinNameCharacter = /^[\p{Script=Latin}\p{Mark} .'-]$/u;
const latinTraceCharacter = /^[\p{Script=Latin}\p{Mark} .,'!?-]$/u;
const persianNameSeparators = new Set([' ', '\u200c', '-', "'"]);
const persianTracePunctuation = new Set([...persianNameSeparators, '.', '،', '؛', '؟', '!']);

export function normalizeUserText(value) {
  return String(value || '').trim().replace(/[\t\n\r ]+/g, ' ');
}

export function validateLatinName(value) {
  const normalized = normalizeUserText(value);
  const characters = Array.from(normalized);
  const valid = characters.some(character => /\p{Script=Latin}/u.test(character)) && characters.every(character => latinNameCharacter.test(character));
  return { valid, value: normalized, reason: normalized ? 'wrong-language' : 'empty' };
}

export function supportedWritingCharacters(language) {
  return new Set((language?.writing || []).flatMap(drill => [drill.letter, ...(drill.forms || []).map(form => form.glyph).filter(Boolean)]));
}

export function validateLocalizedName(value, language) {
  const normalized = normalizeUserText(value).replace(/ي/g, 'ی').replace(/ك/g, 'ک');
  const supported = supportedWritingCharacters(language);
  const characters = Array.from(normalized);
  const valid = characters.some(character => supported.has(character)) && characters.every(character => supported.has(character) || persianNameSeparators.has(character) || /\p{Mark}/u.test(character));
  return { valid, value: normalized, reason: normalized ? 'wrong-language' : 'empty' };
}

export function validateTracingText(value, language) {
  const normalized = normalizeUserText(value);
  if (!normalized) return { valid: false, value: normalized, reason: 'empty' };
  if (language?.writingRules?.script === 'arabic') { const canonical = normalized.replace(/ي/g, 'ی').replace(/ك/g, 'ک'); const supported = supportedWritingCharacters(language); const characters = Array.from(canonical); const valid = characters.some(character => supported.has(character)) && characters.every(character => supported.has(character) || persianTracePunctuation.has(character) || /\p{Mark}/u.test(character)); return { valid, value: canonical, reason: valid ? null : 'wrong-language' }; }
  const characters = Array.from(normalized);
  const valid = characters.some(character => /\p{Script=Latin}/u.test(character)) && characters.every(character => latinTraceCharacter.test(character));
  return { valid, value: normalized, reason: valid ? null : 'wrong-language' };
}
