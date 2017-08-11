export class Sentence {
  text: string;
  start: number;
  end: number;

  constructor(text: string, start: number, end: number) {
    this.text = text;
    this.start = start;
    this.end = end;
  }

  toString() {
    return `${this.text}(${this.start},${this.end})`;
  }
}

/**
 * Sentence Splitter
 */
export function split(s: string): Sentence[] {
  const re = /[^.!?…\s][^.!?…]*(?:[.!?…](?!['\"]?\s|$)[^.!?…]*)*[.!?…]?['\"]?(?=\s|$)/g;
  const sentences: Sentence[] = [];
  let match;

  while((match = re.exec(s)) !== null) {
    sentences.push(new Sentence(match[0], match.index, re.lastIndex));
  }

  return sentences;
};
