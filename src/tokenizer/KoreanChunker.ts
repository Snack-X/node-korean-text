import * as TwitterText from "twitter-text";
import { KoreanPos } from "../util/KoreanPos";
import { KoreanToken } from "./KoreanTokenizer";

interface KoreanChunk {
  text: string,
  offset: number,
  length: number,
};

/**
 * Split input text into Korean Chunks (어절)
 */

const POS_PATTERNS = new Map([
  [ KoreanPos.Korean, /([가-힣]+)/ ],
  [ KoreanPos.Alpha, /([A-Za-z]+)/ ],
  [ KoreanPos.Number, /(\$?[0-9]+(,[0-9]{3})*([/~:\.-][0-9]+)?(천|만|억|조)*(%|원|달러|위안|옌|엔|유로|등|년|월|일|회|시간|시|분|초)?)/ ],
  [ KoreanPos.KoreanParticle, /([ㄱ-ㅣ]+)/ ],
  [ KoreanPos.Punctuation, /([!"#$%&'()*+,\-\./:;<=>?@\[\\\]\^_`{|}~·…’]+)/ ],
  [ KoreanPos.URL, <RegExp>TwitterText.regexen.extractUrl ],
  [ KoreanPos.Email, /([A-Za-z0-9\.\-_]+@[A-Za-z0-9\.]+)/ ],
  [ KoreanPos.Hashtag, <RegExp>TwitterText.regexen.validHashtag ],
  [ KoreanPos.ScreenName, <RegExp>TwitterText.regexen.validMentionOrList ],
  [ KoreanPos.CashTag, <RegExp>TwitterText.regexen.validCashtag ],
]);

const CHUNKING_ORDER = [ KoreanPos.URL, KoreanPos.Email, KoreanPos.ScreenName, KoreanPos.Hashtag, KoreanPos.CashTag, KoreanPos.Number, KoreanPos.Korean, KoreanPos.KoreanParticle, KoreanPos.Alpha, KoreanPos.Punctuation ];

export function getChunks(input: string, keepSpace: boolean = false): string[] {
  return chunk(input).map(c => c.text);
}

export function splitBySpaceKeepingSpace(s: string): string[] {
  const space = /\s+/g;
  const tokens = [];
  let m: RegExpExecArray, index = 0;

  while((m = space.exec(s)) !== null) {
    tokens.push(s.substring(index, m.index));
    tokens.push(m[0]);
    index = m.index + m[0].length;
  }

  tokens.push(s.substring(index, s.length));

  return tokens;
}

class ChunkMatch {
  start: number;
  end: number;
  text: string;
  pos: KoreanPos;

  constructor(start: number, end: number, text: string, pos: KoreanPos) {
    this.start = start;
    this.end = end;
    this.text = text;
    this.pos = pos;
  }

  disjoint(that: ChunkMatch): boolean {
    return (that.start < this.start && that.end <= this.start) ||
      (that.start >= this.end && that.end > this.end)
  }
}

function splitChunks(text: string): ChunkMatch[] {
  if(/\s/.test(text[0])) {
    return [ new ChunkMatch(0, text.length, text, KoreanPos.Space) ];
  }
  else {
    const chunksMatched: ChunkMatch[] = [];
    let matchedLen = 0;

    // TODO: Improve chunk splitting
    // EXPECTED: 300위안짜리 => 300위안(Number) 짜리(Korean)
    // ACTUAL:   300위안짜리 => 300위안(Number) 짜리(Foreign)
    CHUNKING_ORDER.forEach(pos => {
      if(matchedLen < text.length) {
        const r = new RegExp(POS_PATTERNS.get(pos).source, "gi");
        let m: RegExpExecArray;
        
        while((m = r.exec(text)) !== null) {
          const cm = new ChunkMatch(m.index, m.index + m[0].length, m[0], pos);
          if(chunksMatched.map(c => cm.disjoint(c)).filter(r => r === false).length === 0) {
            chunksMatched.push(cm);
            matchedLen += m[0].length;
          }
        }
      }
    });

    const chunks = chunksMatched.sort((a, b) => a.start - b.start);
    return fillInUnmatched(text, chunks, KoreanPos.Foreign); 
  }
}

function fillInUnmatched(text: string, chunks: ChunkMatch[], pos: KoreanPos): ChunkMatch[] {
  const chunksWithForeign = [];
  let prevEnd = 0;

  for(const cm of chunks) {
    if(cm.start === prevEnd) chunksWithForeign.push(cm);
    else if(cm.start > prevEnd) {
      chunksWithForeign.push(new ChunkMatch(prevEnd, cm.start, text.substring(prevEnd, cm.start), pos));
      chunksWithForeign.push(cm);
    }
    else throw new Error("Non-disjoint chunk matches found.");

    prevEnd = cm.end;
  }
  
  if(prevEnd < text.length) {
    chunksWithForeign.push(new ChunkMatch(prevEnd, text.length, text.substring(prevEnd, text.length), pos));
  }

  return chunksWithForeign;
}

export function chunk(input: string): KoreanToken[] {
  const l: ChunkMatch[] = [].concat(...splitBySpaceKeepingSpace(input).map(splitChunks));
  let segStart = 0;
  const tokens: KoreanToken[] = l.map(m => {
    segStart = input.indexOf(m.text, segStart)
    return new KoreanToken(m.text, m.pos, segStart, m.text.length);
  });

  return tokens;
}
