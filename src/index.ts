import * as KoreanNormalizer from "./normalizer/KoreanNormalizer";
import * as KoreanTokenizer from "./tokenizer/KoreanTokenizer";
import { KoreanPos } from "./util/KoreanPos";
import * as KoreanDictionary from "./util/KoreanDictionary";

/**
 * Normalize Korean text. Uses KoreanNormalizer.normalize().
 */
export function normalize(text: string): string {
  return KoreanNormalizer.normalize(text);
}

/**
 * Tokenize with the builder options.
 */
export function tokenize(text: string): KoreanTokenizer.KoreanToken[] {
  return KoreanTokenizer.tokenize(text);
}

/**
 * Add user-defined word list to the noun dictionary. Spaced words are not allowed.
 */
export function addNounsToDictionary(words: string[]) {
  KoreanDictionary.addWordsToDictionary(KoreanPos.Noun, words);
}
