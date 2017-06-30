import { koreanDictionary } from "../util/KoreanDictionary";
import { KoreanPos, KoreanPosTrie, getTrie } from "../util/KoreanPos";
import { chunk } from "./KoreanChunker";
import { TokenizerProfile, defaultProfile } from "./TokenizerProfile";
import { ParsedChunk } from "./ParsedChunk";

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

function CandidateParse(parse: ParsedChunk, curTrie: KoreanPosTrie[], ending?: KoreanPos) {
  return { parse, curTrie, ending };
}

/**
 * Parse Korean text into a sequence of KoreanTokens with custom parameters
 */
export function tokenize(text: string, profile: TokenizerProfile = defaultProfile): KoreanToken[] {
  return [];
}

/**
 * Parse Korean text into a sequence of KoreanTokens with custom parameters
 */
export function tokenizeTopN(text: string, topN: number = 1, profile: TokenizerProfile = defaultProfile): KoreanToken[][][] {
  return chunk(text).map(token => {
    if(token.pos === KoreanPos.Korean) {
      const parsed = parseKoreanChunk(token, profile, topN);
      return parsed;
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

function findTopCandidates(chunk: KoreanToken, profile: TokenizerProfile): KoreanToken[][] {
  const directMatch = findDirectMatch(chunk);

  // Buffer for solutions
  const solutions: Map<number, CandidateParse[]> = new Map();

  // Initial state
  solutions.set(0, [ CandidateParse(new ParsedChunk([], 1, profile), koreanPosTrie) ]);

  // Find N best parsed per state

  return [];
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

