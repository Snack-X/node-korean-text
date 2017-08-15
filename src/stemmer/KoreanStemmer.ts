import { KoreanToken } from "../tokenizer/KoreanTokenizer";
import { koreanDictionary, predicateStems } from "../util/KoreanDictionary";
import { KoreanPos } from "../util/KoreanPos";
import { flatMap } from "../util/utils";

/**
 * Stems Adjectives and Verbs: 새로운 스테밍을 추가했었다. -> 새롭다 + 스테밍 + 을 + 추가 + 하다
 */

const Endings = [ KoreanPos.Eomi, KoreanPos.PreEomi ];
const Predicates = [ KoreanPos.Verb, KoreanPos.Adjective ];
const EndingsForNouns = [ "하다", "되다", "없다" ]

/**
 * Removes Ending tokens recovering the root form of predicates
 */
export function stem(tokens: KoreanToken[]): KoreanToken[] {
  if(tokens.filter(t => t.pos === KoreanPos.Verb || t.pos === KoreanPos.Adjective).length === 0)
    return tokens;

  return tokens.reduce((l: KoreanToken[], token: KoreanToken): KoreanToken[] => {
    if(l.length !== 0 && Endings.includes(token.pos)) {
      if(Predicates.includes(l[0].pos)) {
        const prevToken = l[0];
        return [ new KoreanToken(
          prevToken.text + token.text,
          prevToken.pos, prevToken.offset, prevToken.length + token.length,
          prevToken.stem,
          prevToken.unknown
        ), ...l.slice(1) ];
      }
      else {
        return [ token, ...l ];
      }
    }
    else if(Predicates.includes(token.pos)) {
      return [ new KoreanToken(
        token.text,
        token.pos, token.offset, token.length,
        predicateStems.get(token.pos).get(token.text),
        token.unknown
      ), ...l ];
    }
    else return [ token, ...l ];
  }, []).reverse();
}
