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
  preferredPatterns: KoreanPos[][] = [
    [ KoreanPos.Noun, KoreanPos.Josa ],
    [ KoreanPos.ProperNoun, KoreanPos.Josa ],
  ];
  spaceGuide: number[] = [];
  spaceGuidePenalty: number = 3.0;

  isPreferredPattern(pattern: KoreanPos[]): boolean {
    for(const p of this.preferredPatterns) {
      if(p.length !== pattern.length) return false;

      for(let i = 0 ; i < p.length ; i++)
        if(p[i] !== pattern[i]) return false;
    }

    return true;
  }
}

export const defaultProfile = new TokenizerProfile();
