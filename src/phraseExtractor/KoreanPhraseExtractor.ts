import { KoreanToken } from "../tokenizer/KoreanTokenizer";
import { decomposeHangul } from "../util/Hangul";
import { spamNouns } from "../util/KoreanDictionary";
import { KoreanPos, KoreanPosTrie, getTrie, selfNode } from "../util/KoreanPos";
import { flatMap } from "../util/utils";

/**
 * KoreanPhraseExtractor extracts suitable phrases for trending topics.
 *
 * 1. Collapse sequence of POSes to phrase candidates (초 + 거대 + 기업 + 의 -> 초거대기업 + 의)
 * 2. Find suitable phrases
 */

const MinCharsPerPhraseChunkWithoutSpaces = 2;
const MinPhrasesPerPhraseChunk = 3;

const MaxCharsPerPhraseChunkWithoutSpaces = 30;
const MaxPhrasesPerPhraseChunk = 8;

const ModifyingPredicateEndings = "ㄹㄴ";
const ModifyingPredicateExceptions = "만";

const PhraseTokens = new Set([ KoreanPos.Noun, KoreanPos.ProperNoun, KoreanPos.Space ]);
const ConjunctionJosa = new Set([ "와", "과", "의" ]);

export class KoreanPhrase {
  tokens: KoreanToken[];
  pos: KoreanPos;

  constructor(tokens: KoreanToken[], pos: KoreanPos = KoreanPos.Noun) {
    this.tokens = tokens.slice();
    this.pos = pos;
  }

  get offset(): number { return this.tokens[0].offset; }
  get text(): string { return this.tokens.map(t => t.text).join(""); }
  get length(): number { return this.tokens.reduce((len, token) => len + token.text.length, 0); }

  toString(): string {
    return `${this.text}(pos: ${this.offset}, ${this.length})`;
  }
}

type KoreanPhraseChunk = KoreanPhrase[];

interface PhraseBuffer {
  phrases: KoreanPhrase[];
  curTrie: KoreanPosTrie[];
  ending?: KoreanPos;
}

const PhraseHeadPoses = new Set([ KoreanPos.Adjective, KoreanPos.Noun, KoreanPos.ProperNoun, KoreanPos.Alpha, KoreanPos.Number ]);
const PhraseTailPoses = new Set([ KoreanPos.Noun, KoreanPos.ProperNoun, KoreanPos.Alpha, KoreanPos.Number ]);

/**
 * 0 for optional, 1 for required
 * * for optional repeatable, + for required repeatable
 *
 * Substantive: 체언 (초거대기업의)
 * Predicate: 용언 (하였었습니다, 개예뻤었다)
 * Modifier: 수식언 (모르는 할수도있는 보이기도하는 예뻐 예쁜 완전 레알 초인간적인 잘 잘한)
 * Standalone: 독립언
 * Functional: 관계언 (조사)
 *
 * N Noun: 명사 (Nouns, Pronouns, Company Names, Proper Noun, Person Names, Numerals, Standalone, Dependent)
 * V Verb: 동사 (하, 먹, 자, 차)
 * J Adjective: 형용사 (예쁘다, 크다, 작다)
 * A Adverb: 부사 (잘, 매우, 빨리, 반드시, 과연)
 * D Determiner: 관형사 (새, 헌, 참, 첫, 이, 그, 저)
 * E Exclamation: 감탄사 (헐, ㅋㅋㅋ, 어머나, 얼씨구)
 *
 * C Conjunction: 접속사
 *
 * j SubstantiveJosa: 조사 (의, 에, 에서)
 * l AdverbialJosa: 부사격 조사 (~인, ~의, ~일)
 * e Eomi: 어말어미 (다, 요, 여, 하댘ㅋㅋ)
 * r PreEomi: 선어말어미 (었)
 *
 * p NounPrefix: 접두사 ('초'대박)
 * v VerbPrefix: 동사 접두어 ('쳐'먹어)
 * s Suffix: 접미사 (~적)
 *
 * a Alpha,
 * n Number
 * o Others
 */
const COLLAPSING_RULES = {
  // Substantive
  "D0m*N1s0": KoreanPos.Noun,
  "n*a+n*": KoreanPos.Noun,
  "n+": KoreanPos.Noun,

  // Predicate 초기뻐하다, 와주세요, 초기뻤었고, 추첨하다, 구경하기힘들다, 기뻐하는, 기쁜, 추첨해서, 좋아하다, 걸려있을
  "v*V1r*e0": KoreanPos.Verb,
  "v*J1r*e0": KoreanPos.Adjective,
};
const CollapseTrie = getTrie(COLLAPSING_RULES);

function dropWhile<T>(array: T[], predicate: (value: T, index: number, array: T[]) => boolean): T[] {
  const index = array.findIndex((v, i, a) => !predicate(v, i, a));
  return index === -1 ? array : array.slice(index, array.length);
}

function trimSpaces(tokens: KoreanToken[]): KoreanToken[] { return dropWhile(tokens, t => t.pos === KoreanPos.Space); }
function trimPhraseLeft(phrase: KoreanPhrase): KoreanPhrase { return new KoreanPhrase(trimSpaces(phrase.tokens.reverse()).reverse(), phrase.pos); }
function trimPhraseRight(phrase: KoreanPhrase): KoreanPhrase { return new KoreanPhrase(trimSpaces(phrase.tokens), phrase.pos); }
function trimPhraseBoth(phrase: KoreanPhrase): KoreanPhrase { return new KoreanPhrase(trimSpaces(trimSpaces(phrase.tokens).reverse()).reverse(), phrase.pos); }

function trimPhraseChunk(phrases: KoreanPhraseChunk): KoreanPhraseChunk {
  const trimNonNouns = dropWhile(
    dropWhile(phrases, t => !PhraseHeadPoses.has(t.pos)).reverse(),
    t => !PhraseTailPoses.has(t.pos)
  ).reverse();

  return trimNonNouns.map((phrase, i) => {
    if(phrase.length === 1) return trimPhraseBoth(phrase);
    else if(i === 0) return trimPhraseRight(phrase);
    else if(i === phrase.length - 1) return trimPhraseLeft(phrase);
    else return phrase;
  });
}

function isProperPhraseChunk(phraseChunk: KoreanPhraseChunk): boolean {
  const lastChunk = phraseChunk[phraseChunk.length - 1];
  const lastToken = lastChunk.tokens[lastChunk.tokens.length - 1];
  const notEndingInNonPhraseSuffix = !(lastToken.pos === KoreanPos.Suffix && lastToken.text === "적");

  const phraseChunkWithoutSpaces = phraseChunk.filter(c => c.pos !== KoreanPos.Space);
  const lengthSum = phraseChunkWithoutSpaces.reduce((len, chunk) => len + chunk.length, 0);
  const checkMaxLength = phraseChunkWithoutSpaces.length <= MaxPhrasesPerPhraseChunk && lengthSum <= MaxCharsPerPhraseChunkWithoutSpaces;
  const checkMinLength = phraseChunkWithoutSpaces.length >= MinPhrasesPerPhraseChunk || (phraseChunkWithoutSpaces.length < MinPhrasesPerPhraseChunk && lengthSum >= MinCharsPerPhraseChunkWithoutSpaces);
  const checkMinLengthPerToken = phraseChunkWithoutSpaces.filter(chunk => chunk.length > 1).length > 0;
  const isRightLength = checkMaxLength && checkMinLength && checkMinLengthPerToken;

  return isRightLength && notEndingInNonPhraseSuffix;
}

function collapsePos(tokens: KoreanToken[]): KoreanPhrase[] {
  const getTries = (token: KoreanToken, trie: KoreanPosTrie[]): [ KoreanPosTrie, KoreanPosTrie[] ] => {
    const curTrie = trie.filter(t => t.curPos === token.pos)[0];
    const nextTrie = curTrie.nextTrie.map(nt => nt === selfNode ? curTrie : nt);
    return [ curTrie, nextTrie ];
  };

  const getInit = (phraseBuffer: PhraseBuffer): KoreanPhrase[] => phraseBuffer.phrases.length === 0 ? [] : phraseBuffer.phrases.slice(0, -1);

  let output: PhraseBuffer = { phrases: [], curTrie: CollapseTrie };
  tokens.forEach(token => {
    if(output.curTrie.filter(t => t.curPos === token.pos).length > 0) {
      // Extend the current phrase
      const [ ct, nt ] = getTries(token, output.curTrie);

      if(output.phrases.length === 0 || output.curTrie === CollapseTrie) {
        output = {
          phrases: [ ...output.phrases, new KoreanPhrase([ token ], ct.ending || KoreanPos.Noun) ],
          curTrie: nt, ending: ct.ending,
        };
      }
      else {
        output = {
          phrases: [ ...getInit(output), new KoreanPhrase([ ...output.phrases[output.phrases.length - 1].tokens, token ], ct.ending || KoreanPos.Noun) ],
          curTrie: nt, ending: ct.ending,
        };
      }
    }
    else if(CollapseTrie.filter(t => t.curPos === token.pos).length > 0) {
      // Start a new phrase
      const [ ct, nt ] = getTries(token, CollapseTrie);

      output = {
        phrases: [ ...output.phrases, new KoreanPhrase([ token ], ct.ending || KoreanPos.Noun) ],
        curTrie: nt, ending: ct.ending,
      };
    }
    else {
      // Add a single word
      output = {
        phrases: [ ...output.phrases, new KoreanPhrase([ token ], token.pos) ],
        curTrie: CollapseTrie, ending: output.ending,
      };
    }
  });

  return output.phrases;
}

function distinctPhrases(chunks: KoreanPhraseChunk[]): KoreanPhraseChunk[] {
  let l: KoreanPhraseChunk[] = [], buffer: string[] = [];
  chunks.forEach(chunk => {
    const phraseText = chunk.map(c => c.tokens.map(t => t.text).join("")).join("");
    if(!buffer.includes(phraseText)) {
      l.unshift(chunk);
      buffer.push(phraseText);
    }
  });

  return l.reverse();
}

function getCandidatePhraseChunks(phrase: KoreanPhraseChunk, filterSpam: boolean = false): KoreanPhraseChunk[] {
  const isNotSpam = (phrase: KoreanPhrase): boolean => !filterSpam || phrase.tokens.filter(t => spamNouns.has(t.text)).length === 0;

  const isNonNounPhraseCandidate = (phrase: KoreanPhrase): boolean => {
    const trimmed = trimPhraseBoth(phrase);

    // 하는, 할인된, 할인될, exclude: 하지만
    const lastToken = trimmed.tokens[trimmed.tokens.length - 1];
    const lastChar = lastToken.text[lastToken.text.length - 1];
    const isModifyingPredicate = (trimmed.pos === KoreanPos.Verb || trimmed.pos === KoreanPos.Adjective) &&
      ModifyingPredicateEndings.includes(decomposeHangul(lastChar).coda) &&
      !ModifyingPredicateExceptions.includes(lastChar);

    // 과, 와, 의
    const isConjunction = trimmed.pos === KoreanPos.Josa && ConjunctionJosa.has(trimmed.tokens[trimmed.tokens.length - 1].text);

    const isAlphaNumberic = trimmed.pos === KoreanPos.Alpha || trimmed.pos === KoreanPos.Number;

    return isAlphaNumberic || isModifyingPredicate || isConjunction;
  };

  const collapseNounsPhrase = (phrase: KoreanPhraseChunk): KoreanPhraseChunk => {
    let output: KoreanPhrase[] = [], buffer: KoreanPhrase[] = [];
    phrase.forEach(phrase => {
      if(phrase.pos === KoreanPos.Noun || phrase.pos === KoreanPos.ProperNoun) buffer.push(phrase);
      else {
        const tempPhrases = buffer.length > 0 ? [ new KoreanPhrase(flatMap(buffer, p => p.tokens)), phrase ] : [ phrase ];
        output = [ ...output, ...tempPhrases ];
        buffer = [];
      }
    });

    return buffer.length > 0 ? [ ...output, new KoreanPhrase(flatMap(buffer, p => p.tokens)) ] : output;
  };

  const collapsePhrases = (phrases: KoreanPhraseChunk): KoreanPhraseChunk[] => {

  };
}
