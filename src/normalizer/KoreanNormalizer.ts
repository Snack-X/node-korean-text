import { koreanDictionary, typoDictionaryByLength } from "../util/KoreanDictionary";
import { KoreanPos } from "../util/KoreanPos";
import * as Hangul from "../util/Hangul";

/**
 * Normalize Korean colloquial text
 */
const EXTENDED_KOREA_REGEX = /([ㄱ-ㅣ가-힣]+)/g;
const KOREAN_TO_NORMALIZE_REGEX = /([가-힣]+)(ㅋ+|ㅎ+|[ㅠㅜ]+)/g;
const REPEATING_CHAR_REGEX = /(.)\1{3,}|[ㅠㅜ]{3,}/g;
const REPEATING_2CHAR_REGEX = /(..)\1{2,}/g;

const WHITESPACE_REGEX = /\s+/g;

const CODA_N_EXCPETION = "은는운인텐근른픈닌든던";

/**
 * Normalize Korean text
 * ex) 하댘ㅋㅋㅋ -> 하대, 머구뮤ㅠㅠㅠ -> 머굼
 * 하즤 -> 하지
 */
export function normalize(input: string): string {
  return input.replace(EXTENDED_KOREA_REGEX, normalizeKoreanChunk);
}

function normalizeKoreanChunk(input: string): string {
  // Normalize endings: 안됔ㅋㅋㅋ -> 안돼ㅋㅋ
  const endingNormalized = input.replace(KOREAN_TO_NORMALIZE_REGEX, processNormalizationCandidate);

  // Normalize repeating chars: ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ -> ㅋㅋㅋ
  const exclamationNormalized = endingNormalized.replace(REPEATING_CHAR_REGEX, m => m.substr(0, 3));

  // Normalize repeating chars: 훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍 -> 훌쩍훌쩍
  const repeatingNormalized = exclamationNormalized.replace(REPEATING_2CHAR_REGEX, m => m.substr(0, 4));

  // Coda normalization (명사 + ㄴ 첨가 정규화): 소린가 -> 소리인가
  const codaNNormalized = normalizeCodaN(repeatingNormalized);

  // Typo correction: 하겟다 -> 하겠다
  const typoCorrected = correctTypo(codaNNormalized);

  // Spaces, tabs, new lines are replaced with a single space.
  return typoCorrected.replace(WHITESPACE_REGEX, " ");
}

export function correctTypo(chunk: string): string {
  let output = chunk;

  typoDictionaryByLength.forEach((typoMap, wordLen) => {
    for(let i = 0 ; i <= chunk.length - wordLen ; i++) {
      const slice = chunk.substr(i, wordLen);
      if(typoMap.has(slice)) {
        // Evil replaceAll
        output = output.split(slice).join(typoMap.get(slice));
      }
    }
  });

  return output;
}

export function normalizeCodaN(chunk: string): string {
  if(chunk.length < 2) return chunk;

  const lastTwo = chunk.substr(-2);
  const last = chunk[chunk.length - 1];

  const lastTwoHead = lastTwo[0];

  // Exception cases
  if(
    koreanDictionary.get(KoreanPos.Noun).has(chunk) ||
    koreanDictionary.get(KoreanPos.Conjunction).has(chunk) ||
    koreanDictionary.get(KoreanPos.Adverb).has(chunk) ||
    koreanDictionary.get(KoreanPos.Noun).has(lastTwo) ||
    // This looks strange, but it works
    lastTwoHead < "가" || lastTwoHead > "힣" ||
    CODA_N_EXCPETION.includes(lastTwoHead)
  ) {
    return chunk;
  }

  const hc = Hangul.decomposeHangul(lastTwoHead);

  const newHead = chunk.substr(0, chunk.length - 2) + Hangul.composeHangul(hc.onset, hc.vowel);

  if(
    hc.coda === "ㄴ" &&
    (last === "데" || last === "가" || last === "지") &&
    koreanDictionary.get(KoreanPos.Noun).has(newHead)
  ) {
    const mid = hc.vowel === "ㅡ" ? "은" : "인";
    return newHead + mid + last;
  }
  else {
    return chunk;
  }
}
 
function processNormalizationCandidate(match: string, chunk: string, toNormalize: string): string {
  let normalizedChunk;

  if (
    koreanDictionary.get(KoreanPos.Noun).has(chunk) ||
    koreanDictionary.get(KoreanPos.Eomi).has(chunk.substr(-1)) ||
    koreanDictionary.get(KoreanPos.Eomi).has(chunk.substr(-2))
  ) normalizedChunk = chunk;
  else {
    normalizedChunk = normalizeEmotionAttachedChunk(chunk, toNormalize);
  }

  return normalizedChunk + toNormalize;
}

function normalizeEmotionAttachedChunk(s: string, toNormalize: string): string {
  const init = s.substr(0, s.length - 1);
  let secondToLastDecomposed = null;
  if(init.length > 0) {
    const hc = Hangul.decomposeHangul(init[init.length - 1]);
    if(hc.coda === " ") secondToLastDecomposed = hc;
    else secondToLastDecomposed = null;
  }

  const decomposed = Hangul.decomposeHangul(s[s.length - 1]);

  if(decomposed.coda === "ㅋ" || decomposed.coda === "ㅎ") {
    return init + Hangul.composeHangul(decomposed.onset, decomposed.vowel);
  }
  else if(decomposed.coda === " ") {
    if(secondToLastDecomposed && decomposed.vowel === toNormalize[0] && Hangul.CODA_MAP.has(decomposed.onset)) {
      const hc = secondToLastDecomposed;
      return init.substr(0, init.length - 1) + Hangul.composeHangul(hc.onset, hc.vowel, decomposed.onset);
    }
  }

  return s;
}
