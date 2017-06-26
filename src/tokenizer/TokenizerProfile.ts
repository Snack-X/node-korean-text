import { KoreanPos } from "../util/KoreanPos";

// Lower score is better
export class TokenizerProfile {
  tokenCount: number = 0.18;
  unknown: number = 0.3;
  wordCount: number = 0.3;
  freq: number = 0.2;
  unknownCoverage: number = 0.5;
  exactMatch: number = 0.5;
  allNoun: number = 0.1;
  unknownPosCount: number = 10.0;
  determinerPosCount: number = -0.01;
  exclamationPosCount: number = 0.01;
  initialPostPosition: number = 0.2;
  haVerb: number = 0.3;
  preferredPattern: number = 0.6;
  preferredPatterns: any[][] = [
    [ KoreanPos.Noun, KoreanPos.Josa ],
    [ KoreanPos.ProperNoun, KoreanPos.Josa ],
  ],
  spaceGuide: number[] = [];
  spaceGuidePenalty: number = 3.0;
}

export const defaultProfile = new TokenizerProfile();
