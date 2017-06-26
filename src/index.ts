import * as KoreanNormalizer from "./normalizer/KoreanNormalizer";
import { KoreanPos } from "./util/KoreanPos";
import * as KoreanDictionary from "./util/KoreanDictionary";

/**
 * Normalize Korean text. Uses KoreanNormalizer.normalize().
 */
export function normalize(text: string): string {
  return KoreanNormalizer.normalize(text);
}

/**
 * Add user-defined word list to the noun dictionary. Spaced words are not allowed.
 */
export function addNounsToDictionary(words: string[]) {
  KoreanDictionary.addWordsToDictionary(KoreanPos.Noun, words);
}
