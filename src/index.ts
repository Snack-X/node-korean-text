import * as KoreanNormalizer from "./normalizer/KoreanNormalizer";
import * as KoreanDetokenizer from "./tokenizer/KoreanDetokenizer";
import * as KoreanTokenizer from "./tokenizer/KoreanTokenizer";
import * as KoreanSentenceSplitter from "./tokenizer/KoreanSentenceSplitter";
import { KoreanPos } from "./util/KoreanPos";
import * as KoreanDictionary from "./util/KoreanDictionary";

import KoreanToken = KoreanTokenizer.KoreanToken;
import Sentence = KoreanSentenceSplitter.Sentence;

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
 * Tokenize with the builder options into a Strings.
 */
export function tokensToStrings(tokens: KoreanToken[], keepSpace: boolean = false): string[] {
  return tokens.filter(token => keepSpace || token.pos !== KoreanPos.Space).map(token => token.text);
}

/**
 * Add user-defined word list to the noun dictionary. Spaced words are not allowed.
 */
export function addNounsToDictionary(words: string[]) {
  KoreanDictionary.addWordsToDictionary(KoreanPos.Noun, words);
}

/**
 * Split input text into sentences.
 */
export function splitSentences(text: string): Sentence[] {
  return KoreanSentenceSplitter.split(text);
}

/**
 * Detokenize the input list of words.
 */
export function detokenize(tokens: string[]): string {
  return KoreanDetokenizer.detokenize(tokens);
}

/**
 * KoreanPos is exported for convenience
 */
export { KoreanPos };
