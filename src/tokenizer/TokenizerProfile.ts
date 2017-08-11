import { KoreanPos } from "../util/KoreanPos";

const defaultValue = {
  tokenCount: 0.18,
  unknown: 0.3,
  wordCount: 0.3,
  freq: 0.2,
  unknownCoverage: 0.5,
  exactMatch: 0.5,
  allNoun: 0.1,
  unknownPosCount: 10.0,
  determinerPosCount: -0.01,
  exclamationPosCount: 0.01,
  initialPostPosition: 0.2,
  haVerb: 0.3,
  preferredPattern: 0.6,
  preferredPatterns: [
    [ KoreanPos.Noun, KoreanPos.Josa ],
    [ KoreanPos.ProperNoun, KoreanPos.Josa ],
  ],
  spaceGuide: [],
  spaceGuidePenalty: 3.0,
};

// Lower score is better
export class TokenizerProfile {
  tokenCount: number;
  unknown: number;
  wordCount: number;
  freq: number;
  unknownCoverage: number;
  exactMatch: number;
  allNoun: number;
  unknownPosCount: number;
  determinerPosCount: number;
  exclamationPosCount: number;
  initialPostPosition: number;
  haVerb: number;
  preferredPattern: number;
  preferredPatterns: KoreanPos[][];
  spaceGuide: number[];
  spaceGuidePenalty: number;

  constructor(options = {}) {
    const profile = Object.assign({}, defaultValue, options);
    for(const key in defaultValue) this[key] = profile[key];
  }

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
