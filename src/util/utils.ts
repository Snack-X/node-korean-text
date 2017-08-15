export function flatMap<T, U>(array: T[], callbackfn: (value: T, index: number, array: T[]) => U[]): U[] {
  return [].concat(...array.map(callbackfn));
}

// String conversion routines for debugging
import { CandidateParse } from "../tokenizer/KoreanTokenizer";
import { ParsedChunk } from "../tokenizer/ParsedChunk";
import { KoreanPos } from "../util/KoreanPos";

export function toStringSolution(solution: CandidateParse[]): string {
  return solution.map(toStringCandidateParse).join("\n");
}

export function toStringCandidateParse(candidateParse: CandidateParse): string {
  let output = "CandidateParse(";
  output += `parse=${toStringParsedChunk(candidateParse.parse)}`;

  if(candidateParse.ending) output += ` ending=${KoreanPos[candidateParse.ending]}`;

  output += ")";
  return output;
}

export function toStringParsedChunk(parsedChunk: ParsedChunk): string {
  let scoreInfo = [
    parsedChunk.countTokens,
    parsedChunk.countUnknowns,
    parsedChunk.words,
    parsedChunk.getUnknownCoverage,
    parsedChunk.getFreqScore,
    parsedChunk.countPos(KoreanPos.Unknown),
    parsedChunk.isExactMatch,
    parsedChunk.isAllNouns,
    parsedChunk.isPreferredPattern,
    parsedChunk.countPos(KoreanPos.Determiner),
    parsedChunk.countPos(KoreanPos.Exclamation),
    parsedChunk.isInitialPostPosition,
    parsedChunk.isNounHa,
    parsedChunk.hasSpaceOutOfGuide,
    parsedChunk.josaMismatched
  ].join(",");
  return `ParsedChunk(nodes=[${parsedChunk.posNodes.join(",")}] words=${parsedChunk.words} score=${parsedChunk.score} <${scoreInfo}> tiebreaker=${parsedChunk.posTieBreaker} )`;
}
