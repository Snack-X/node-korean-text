import { tokenize, KoreanToken } from "./KoreanTokenizer";
import { TokenizerProfile } from "./TokenizerProfile";
import { KoreanPos } from "../util/KoreanPos";

const SuffixPos = [ KoreanPos.Josa, KoreanPos.Eomi, KoreanPos.PreEomi, KoreanPos.Suffix,
  KoreanPos.Punctuation ];
const PrefixPos = [ KoreanPos.Modifier, KoreanPos.VerbPrefix ];

/**
 * Detokenizes a list of tokenized words into a readable sentence.
 */
export function detokenize(input: string[]): string {
  // Space guide prevents tokenizing a word that was not tokenized in the input.
  const spaceGuide = getSpaceGuide(input);

  // Tokenize a merged text with the space guide.
  const tokenized = tokenize(input.join(""), new TokenizerProfile({ spaceGuide }));

  // Attach suffixes and prefixes.
  // Attach Noun + Verb
  return collapseTokens(tokenized).join(" ");
}

function collapseTokens(tokenized: KoreanToken[]): string[] {
  let output: string[] = [], isPrefix = false, prev = null;

  tokenized.forEach(token => {
    if(output.length !== 0 && (isPrefix || SuffixPos.includes(token.pos))) {
      const attached = (output[output.length - 1] || "") + token.text;
      
      output[output.length - 1] = attached;
      isPrefix = false;
      prev = token;
    }
    else if(prev !== null && prev.pos === KoreanPos.Noun && token.pos === KoreanPos.Verb) {
      const attached = (output[output.length - 1] || "") + token.text;
      
      output[output.length - 1] = attached;
      isPrefix = false;
      prev = token;
    } 
    else if(PrefixPos.includes(token.pos)) {
      output.push(token.text);
      isPrefix = true;
      prev = token;
    }
    else {
      output.push(token.text);
      isPrefix = false;
      prev = token;
    }
  });

  return output;
}

function getSpaceGuide(input: string[]): number[] {
  let spaceGuide: number[] = [], index = 0;

  input.forEach(word => {
    index += word.length;
    spaceGuide.push(index);
  });

  return spaceGuide;
}