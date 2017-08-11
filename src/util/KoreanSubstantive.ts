import { KoreanToken } from "../tokenizer/KoreanTokenizer";
import { composeHangul, decomposeHangul, hasCoda, CODA_MAP } from "./Hangul";
import { koreanDictionary, nameDictionary } from "./KoreanDictionary";
import { KoreanPos } from "./KoreanPos";

/**
 * Helper methods for Korean nouns and josas.
 */

const JOSA_HEAD_FOR_CODA = new Set(["은", "이", "을", "과", "아"]);
const JOSA_HEAD_FOR_NO_CODA = new Set(["는", "가", "를", "와", "야", "여", "라"]);

export function isJosaAttachable(prevChar: string, headChar: string): boolean {
  return (hasCoda(prevChar) && !JOSA_HEAD_FOR_NO_CODA.has(headChar)) ||
         (!hasCoda(prevChar) && !JOSA_HEAD_FOR_CODA.has(headChar));
}

export function isName(chunk: string): boolean {
  if(nameDictionary["full_name"].has(chunk) ||
    nameDictionary["given_name"].has(chunk)) return true;
  else if(chunk.length === 3 &&
    nameDictionary["family_name"].has(chunk[0]) &&
    nameDictionary["given_name"].has(chunk.slice(1, 3))) return true;
  else if(chunk.length === 4 &&
    nameDictionary["family_name"].has(chunk.slice(0, 2)) &&
    nameDictionary["given_name"].has(chunk.slice(2, 4))) return true;
  else return false;
}

const NUMBER_REGEX = /^[일이삼사오육칠팔구천백십해경조억만]*[일이삼사오육칠팔구천백십해경조억만원배분초]$/;

export function isKoreanNumber(chunk: string): boolean {
  return NUMBER_REGEX.test(chunk);
}

/**
 * Check if this chunk is an 'ㅇ' omitted variation of a noun
 * (우혀니 -> 우현, 우현이, 빠순이 -> 빠순, 빠순이)
 */
export function isKoreanNameVariation(chunk: string): boolean {
  if(isName(chunk)) return true;
  if(chunk.length < 3 || chunk.length > 5) return false;

  const decomposed = [...chunk].map(c => decomposeHangul(c));
  const lastChar = decomposed[decomposed.length - 1];
  if(!CODA_MAP.has(lastChar.onset)) return false;
  if(lastChar.onset === "ㅇ" || lastChar.vowel !== "ㅣ" || lastChar.coda !== " ") return false;
  if(decomposed[decomposed.length - 2].coda !== " ") return false;

  const recovered = decomposed.map((hc, i) => {
    if(i === chunk.length - 1) return "이";
    if(i === chunk.length - 2) return composeHangul(hc.onset, hc.vowel, lastChar.onset);
    return composeHangul(hc.onset, hc.vowel, hc.coda);
  }).join("");

  return isName(recovered) || isName(recovered.slice(0, -1));
}

/**
 * Collapse all the one-char nouns into one unknown noun
 */
export function collapseNouns(posNodes: KoreanToken[]): KoreanToken[] {
  let nodes: KoreanToken[] = [], collapsing = false;

  for(const p of posNodes) {
    if(p.pos === KoreanPos.Noun && p.text.length === 1) {
      if(collapsing) {
        const text = nodes[0].text + p.text;
        const offset = nodes[0].offset;
        nodes[0] = new KoreanToken(text, KoreanPos.Noun, offset, text.length, undefined, true);
        collapsing = true;
      }
      else {
        nodes.unshift(p);
        collapsing = true;
      }
    }
    else {
      nodes.unshift(p);
      collapsing = false;
    }
  }

  return nodes.reverse();
}
