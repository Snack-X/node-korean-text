import { TokenizerProfile, defaultProfile } from "./TokenizerProfile";
import { ParsedChunk } from "./ParsedChunk";

import { chunk } from "./KoreanChunker";
import { koreanDictionary } from "../util/KoreanDictionary";
import { KoreanPos, KoreanPosTrie, getTrie, selfNode } from "../util/KoreanPos";
import { isName, isKoreanNameVariation, isKoreanNumber, collapseNouns } from "../util/KoreanSubstantive";

/**
 * Provides Korean tokenization.
 *
 * Chunk: 어절 - 공백으로 구분되어 있는 단위 (사랑하는사람을)
 * Word: 단어 - 하나의 문장 구성 요소 (사랑하는, 사람을)
 * Token: 토큰 - 형태소와 비슷한 단위이지만 문법적으로 정확하지는 않음 (사랑, 하는, 사람, 을)
 *
 * Whenever there is an updates in the behavior of KoreanParser,
 * the initial cache has to be updated by running tools.CreateInitialCache.
 */

const TOP_N_PER_STATE = 5;
const MAX_TRACE_BACK = 8;

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
 * m Modifier: 관형사 ('초'대박)
 * v VerbPrefix: 동사 접두어 ('쳐'먹어)
 * s Suffix: 접미사 (~적)
 */
const SequenceDefinition = {
  // Substantive
  "D0m*N1s0j0": KoreanPos.Noun,
  // Predicate 초기뻐하다, 와주세요, 초기뻤었고, 추첨하다, 구경하기힘들다, 기뻐하는, 기쁜, 추첨해서, 좋아하다, 걸려있을
  "v*V1r*e0": KoreanPos.Verb,
  "v*J1r*e0": KoreanPos.Adjective,
  // Modifier 부사
  "A1": KoreanPos.Adverb,
  // Standalone
  "C1": KoreanPos.Conjunction,
  "E+": KoreanPos.Exclamation,
  "j1": KoreanPos.Josa,
};

const koreanPosTrie = getTrie(SequenceDefinition);

export class KoreanToken {
  text: string;
  pos: KoreanPos;
  offset: number;
  length: number;
  stem?: string;
  unknown: boolean = false;

  constructor(text: string, pos: KoreanPos, offset: number, length: number, stem?: string, unknown: boolean = false) {
    this.text = text;
    this.pos = pos;
    this.offset = offset;
    this.length = length;
    this.stem = stem;
    this.unknown = unknown;
  }

  equals(that: KoreanToken): boolean {
    return this.text === that.text &&
      this.pos === that.pos &&
      this.offset === that.offset &&
      this.length === that.length &&
      this.stem === that.stem &&
      this.unknown === that.unknown;
  }

  toString(): string {
    const unknownStar = this.unknown ? "*" : "";
    const stemString = this.stem ? `(${this.stem})` : "";
    return `${this.text}${unknownStar}(${KoreanPos[this.pos]}${stemString}: ${this.offset}, ${this.length})`;
  }

  copyWithNewPos(pos: KoreanPos): KoreanToken {
    return new KoreanToken(this.text, pos, this.offset, this.length, undefined, this.unknown);
  }
}

interface CandidateParse {
  parse: ParsedChunk,
  curTrie: KoreanPosTrie[],
  ending?: KoreanPos,
};

function CandidateParse(parse: ParsedChunk, curTrie: KoreanPosTrie[], ending?: KoreanPos): CandidateParse {
  return { parse, curTrie, ending };
}

interface PossibleTrie {
  curTrie: KoreanPosTrie,
  words: number,
};

function PossibleTrie(curTrie: KoreanPosTrie, words: number): PossibleTrie {
  return { curTrie, words };
}

/**
 * Parse Korean text into a sequence of KoreanTokens with custom parameters
 */
export function tokenize(text: string, profile: TokenizerProfile = defaultProfile): KoreanToken[] {
  const tokenized = tokenizeTopN(text, 1, profile).map(tokens => tokens[0]);
  return [];
  // return KoreanStemmer.stem(tokenized);
}

/**
 * Parse Korean text into a sequence of KoreanTokens with custom parameters
 */
export function tokenizeTopN(text: string, topN: number = 1, profile: TokenizerProfile = defaultProfile): KoreanToken[][][] {
  return chunk(text).map(token => {
    if(token.pos === KoreanPos.Korean) {
      // Get the best parse of each chunk
      const parsed = parseKoreanChunk(token, profile, topN);

      // Collapse sequence of one-char nouns into one unknown noun: (가Noun 회Noun -> 가회Noun*)
      return parsed.map(collapseNouns);
    }
    else {
      return [[ token ]];
    }
  });
}

/**
 * Find the best parse using dynamic programming.
 */
function parseKoreanChunk(chunk: KoreanToken, profile: TokenizerProfile = defaultProfile, topN: number = 1): KoreanToken[][] {
  return findTopCandidates(chunk, profile).slice(0, topN);
}

function flatMap<T, U>(array: T[], callbackfn: (value: T, index: number, array: T[]) => U[]): U[] {
    return [].concat(...array.map(callbackfn));
}

function findTopCandidates(chunk: KoreanToken, profile: TokenizerProfile): KoreanToken[][] {
  const directMatch = findDirectMatch(chunk);

  // Buffer for solutions
  const solutions: Map<number, CandidateParse[]> = new Map();

  // Initial state
  solutions.set(0, [ CandidateParse(new ParsedChunk([], 1, profile), koreanPosTrie) ]);

  // Find N best parsed per state
  for(let end = 1 ; end <= chunk.length ; end++) {
    for(let start = end - 1 ; start >= Math.max(end - MAX_TRACE_BACK, 0) ; start--) {
      const word = chunk.text.slice(start, end);

      const curSolutions = solutions.get(start);

      const candidates = flatMap(curSolutions, solution => {
        let possiblePoses: PossibleTrie[] = solution.curTrie.map(t => PossibleTrie(t, 0));
        if(solution.ending)
          possiblePoses = possiblePoses.concat(koreanPosTrie.map(t => PossibleTrie(t, 1)));

        return possiblePoses.filter(t =>
          t.curTrie.curPos === KoreanPos.Noun ||
          koreanDictionary.get(t.curTrie.curPos).has(word)
        ).map(t => {
          let candidateToAdd: ParsedChunk;
          if(t.curTrie.curPos === KoreanPos.Noun && !koreanDictionary.get(KoreanPos.Noun).has(word)) {
            const isWordName = isName(word);
            const isWordKoreanNameVariation = isKoreanNameVariation(word)

            const unknown = !isWordName && !isKoreanNumber(word) && !isWordKoreanNameVariation;
            const pos = KoreanPos.Noun;
            candidateToAdd = new ParsedChunk([
              new KoreanToken(word, pos, chunk.offset + start, word.length, undefined, unknown)
            ], t.words, profile);
          }
          else {
            const pos = t.curTrie.curPos;
            candidateToAdd = new ParsedChunk([
              new KoreanToken(word, pos, chunk.offset + start, word.length)
            ], t.words, profile);
          }

          const nextTrie = t.curTrie.nextTrie.map(nt => nt === selfNode ? t.curTrie : nt);

          return CandidateParse(solution.parse.add(candidateToAdd), nextTrie, t.curTrie.ending);
        });
      });

      const currentSolutions = solutions.has(end) ? solutions.get(end) : [];

      solutions.set(end, currentSolutions.concat(candidates).sort((a, b) => {
        const score = a.parse.score - b.parse.score;
        if(score !== 0) return score;
        else a.parse.posTieBreaker - b.parse.posTieBreaker;
      }).slice(0, TOP_N_PER_STATE));
    }
  }

  const topCandidates = solutions.get(chunk.length).length === 0 ?
    // If the chunk is not parseable, treat it as a unknown noun chunk.
    [[ new KoreanToken(chunk.text, KoreanPos.Noun, 0, chunk.length, undefined, true) ]] :
    // Return the best parse of the final state
    solutions.get(chunk.length).sort((a, b) => a.parse.score - b.parse.score).map(p => p.parse.posNodes);

  // Evil hacky thing to filter distinct items
  const sameCandidate = (a: KoreanToken[], b: KoreanToken[]): boolean => {
    if(a.length !== b.length) return false;
    for(let i = 0 ; i < a.length ; i++) if(!a[i].equals(b[i])) return false;
    return true;
  };

  const allCandidates: KoreanToken[][] = [].concat(directMatch, topCandidates);
  return allCandidates.filter((candidate, index, self) => {
    return self.findIndex(c => sameCandidate(candidate, c)) === index;
  });
}

function findDirectMatch(chunk: KoreanToken): KoreanToken[][] {
  // Direct match
  // This may produce 하 -> PreEomi
  koreanDictionary.forEach((dict, pos) => {
    if(dict.has(chunk.text)) {
      return [[ chunk.copyWithNewPos(pos) ]];
    }
  });

  return [];
}

