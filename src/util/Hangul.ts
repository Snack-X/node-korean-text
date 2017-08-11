/**
 * Hangul analysis helper. One Hangul character can be decomposed to consonants and a vowel.
 * This object helps analyze Korean character by consonant and vowel level.
 */

export interface HangulChar {
  onset: string,
  vowel: string,
  coda: string,
};

const HANGUL_BASE = 0xac00;
const ONSET_BASE = 21 * 28;
const VOWEL_BASE = 28;

export const ONSET_LIST = [
  "ㄱ", "ㄲ", "ㄴ", "ㄷ", "ㄸ", "ㄹ", "ㅁ", "ㅂ", "ㅃ",
  "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅉ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ",
];

export const VOWEL_LIST = [
  "ㅏ", "ㅐ", "ㅑ", "ㅒ", "ㅓ", "ㅔ",
  "ㅕ", "ㅖ", "ㅗ", "ㅘ", "ㅙ", "ㅚ",
  "ㅛ", "ㅜ", "ㅝ", "ㅞ", "ㅟ", "ㅠ",
  "ㅡ", "ㅢ", "ㅣ"
];

export const CODA_LIST = [
  " ", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ",
  "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ",
  "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ",
  "ㅋ", "ㅌ", "ㅍ", "ㅎ"
];

const LIST_AS_MAP = (v, i) => <[string, number]>[ v, i ];
export const ONSET_MAP = new Map(ONSET_LIST.map(LIST_AS_MAP))
export const VOWEL_MAP = new Map(VOWEL_LIST.map(LIST_AS_MAP))
export const CODA_MAP = new Map(CODA_LIST.map(LIST_AS_MAP))

export function decomposeHangul(c: string): HangulChar {
  const u = c.charCodeAt(0) - HANGUL_BASE;
  return {
    onset: ONSET_LIST[~~(u / ONSET_BASE)],
    vowel: VOWEL_LIST[~~((u % ONSET_BASE) / VOWEL_BASE)],
    coda: CODA_LIST[u % VOWEL_BASE],
  };
}

export function hasCoda(c: string): boolean {
  return (c.charCodeAt(0) - HANGUL_BASE) % VOWEL_BASE > 0
}

export function composeHangul(onset: string, vowel: string, coda: string = " "): string {
  return String.fromCharCode(
    HANGUL_BASE +
    (ONSET_MAP.get(onset) * ONSET_BASE) +
    (VOWEL_MAP.get(vowel) * VOWEL_BASE) +
    CODA_MAP.get(coda)
  );
}
