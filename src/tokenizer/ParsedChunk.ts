import { KoreanToken } from "./KoreanTokenizer";
import { koreanEntityFreq } from "../util/KoreanDictionary";
import { hasCoda, decomposeHangul } from "../util/Hangul";
import { KoreanPos } from "../util/KoreanPos";
import { TokenizerProfile, defaultProfile } from "./TokenizerProfile";

/**
 * A candidate parse for a chunk.
 */
export class ParsedChunk {
  static suffixes = new Set([ KoreanPos.Suffix, KoreanPos.Eomi, KoreanPos.Josa, KoreanPos.PreEomi ]);
  static prefferedBeforeHaVerb = new Set([ KoreanPos.Noun, KoreanPos.ProperNoun, KoreanPos.VerbPrefix ]);

  posNodes: KoreanToken[];
  words: number;
  profile: TokenizerProfile;

  constructor(posNodes: KoreanToken[], words: number, profile: TokenizerProfile = defaultProfile) {
    this.posNodes = posNodes;
    this.words = words;
    this.profile = profile;
  }

  get score(): number {
    return (
      this.countTokens                     * this.profile.tokenCount +
      this.countUnknowns                   * this.profile.unknown +
      this.words                           * this.profile.wordCount +
      this.getUnknownCoverage              * this.profile.unknownCoverage +
      this.getFreqScore                    * this.profile.freq +
      this.countPos(KoreanPos.Unknown)     * this.profile.unknownPosCount +
      this.isExactMatch                    * this.profile.exactMatch +
      this.isAllNouns                      * this.profile.allNoun +
      this.isPreferredPattern              * this.profile.preferredPattern +
      this.countPos(KoreanPos.Determiner)  * this.profile.determinerPosCount +
      this.countPos(KoreanPos.Exclamation) * this.profile.exclamationPosCount +
      this.isInitialPostPosition           * this.profile.initialPostPosition +
      this.isNounHa                        * this.profile.haVerb +
      this.hasSpaceOutOfGuide              * this.profile.spaceGuidePenalty +
      this.josaMismatched                  * this.profile.josaUnmatchedPenalty
    );
  }

  get countUnknowns(): number { return this.posNodes.filter(p => p.unknown).length; }
  get countTokens(): number { return this.posNodes.length; }
  get isInitialPostPosition(): number {
    return ParsedChunk.suffixes.has(this.posNodes[0].pos) ? 1 : 0;
  }
  get isExactMatch(): number { return this.posNodes.length === 1 ? 0 : 1; }
  get hasSpaceOutOfGuide(): number {
    if(this.profile.spaceGuide.length === 0) return 0;
    else return this.posNodes
                    .filter(p => !ParsedChunk.suffixes.has(p.pos))
                    .filter(p => this.profile.spaceGuide.indexOf(p.offset) === -1).length;
  }
  get isAllNouns(): number {
    return this.posNodes
               .filter(t => t.pos !== KoreanPos.Noun && t.pos !== KoreanPos.ProperNoun)
               .length === 0 ? 0 : 1;
  }
  get isPreferredPattern(): number {
    return this.posNodes.length === 2 &&
           this.profile.isPreferredPattern(this.posNodes.map(p => p.pos)) ? 0 : 1;
  }
  get isNounHa(): number {
    return this.posNodes.length >= 2 &&
           ParsedChunk.prefferedBeforeHaVerb.has(this.posNodes[0].pos) &&
           this.posNodes[1].pos === KoreanPos.Verb &&
           this.posNodes[1].text.startsWith("하") ? 0 : 1;
  }
  get posTieBreaker(): number {
    return this.posNodes.reduce((prev, cur) => prev + cur.pos, 0);
  }
  get getUnknownCoverage(): number {
    return this.posNodes.reduce((sum, p) => p.unknown ? sum + p.text.length : sum, 0);
  }
  get getFreqScore(): number {
    return (
      this.posNodes.reduce((output, p) =>
        (p.pos === KoreanPos.Noun || p.pos === KoreanPos.ProperNoun) ?
        output + (1 - (koreanEntityFreq.get(p.text) || 0)) :
        output + 1,
      0) / this.posNodes.length
    );
  }

  add(that: ParsedChunk): ParsedChunk {
    return new ParsedChunk([...this.posNodes, ...that.posNodes], this.words + that.words, this.profile);
  }

  countPos(pos: KoreanPos): number {
    return this.posNodes.filter(p => p.pos === pos).length;
  }

  get josaMismatched(): number {
    let mismatched = true;

    for(let idx = 0 ; idx < this.posNodes.length - 1 ; idx++) {
      const head = this.posNodes[idx], last = this.posNodes[idx + 1];
      if(head.pos === KoreanPos.Noun && last.pos === KoreanPos.Josa) {
        const headLastChar = head.text[head.text.length - 1];
        if(hasCoda(headLastChar)) {
          const nounEnding = decomposeHangul(headLastChar);
          mismatched = mismatched || ((nounEnding.coda !== "ㄹ" || last.text[0] === "로") || "는를다".includes(last.text));
        }
        else {
          mismatched = mismatched || (last.text[0] === "으" || "은을이".includes(last.text));
        }
      }
      else {
        mismatched = mismatched || false;
      }
    }
    
    return mismatched ? 1 : 0;
  }
}
