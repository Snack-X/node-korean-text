import * as fs from "fs";
import * as path from "path";
import * as zlib from "zlib";
import { KoreanPos } from "./KoreanPos";
import { conjugatePredicated } from "./KoreanConjugation";

const DATA_PATH: string = path.join(__dirname, "../../data");

function readLines(buf: Buffer): string[] {
  return buf.toString("utf8").split("\n").map(l => l.trim()).filter(l => l.length > 0);
}

function readWordFreqs(filename: string): Map<string, number> {
  const lines = readFileByLineFromResources(filename);
  const freqMap = new Map(
    lines.filter(l => l.includes("\t")).map(l => {
      const data = l.split("\t");
      return <[string, number]>[ data[0], parseFloat(data[1].substr(0, 6)) ];
    })
  );

  return freqMap;
}

function readWordMap(filename: string): Map<string, string> {
  const lines = readFileByLineFromResources(filename);
  const map = new Map<string, string>(
    lines.filter(l => l.includes(" ")).map(l => {
      const data = l.split(" ");
      return <[string, string]>[data[0], data[1]];
    })
  );

  return map;
}

function readWords(filenames: string[]): Set<string> {
  const set = new Set<string>(
    [].concat(...filenames.map(readFileByLineFromResources))
  );

  return set
}

function readFileByLineFromResources(filename: string): string[] {
  let data = fs.readFileSync(path.join(DATA_PATH, filename));
  if(filename.endsWith(".gz")) data = zlib.gunzipSync(data);

  return readLines(data);
}

export const koreanEntityFreq = readWordFreqs("freq/entity-freq.txt.gz");

export function addWordsToDictionary(pos: KoreanPos, words: string[]) {
  const dict = koreanDictionary.get(pos);
  words.forEach(word => dict.add(word));
}

export const koreanDictionary = new Map([
  [ KoreanPos.Noun,
    readWords([
      "noun/nouns.txt", "noun/entities.txt", "noun/spam.txt",
      "noun/names.txt", "noun/twitter.txt", "noun/lol.txt",
      "noun/slangs.txt", "noun/company_names.txt",
      "noun/foreign.txt", "noun/geolocations.txt", "noun/profane.txt",
      "substantives/given_names.txt", "noun/kpop.txt", "noun/bible.txt",
      "noun/pokemon.txt", "noun/congress.txt", "noun/wikipedia_title_nouns.txt"
    ]) ],
  [ KoreanPos.Verb, conjugatePredicated(readWords([ "verb/verb.txt" ]), false) ],
  [ KoreanPos.Adjective, conjugatePredicated(readWords([ "adjective/adjective.txt" ]), true) ],
  [ KoreanPos.Adverb, readWords([ "adverb/adverb.txt" ]) ],
  [ KoreanPos.Determiner, readWords([ "auxiliary/determiner.txt" ]) ],
  [ KoreanPos.Exclamation, readWords([ "auxiliary/exclamation.txt" ]) ],
  [ KoreanPos.Josa, readWords([ "josa/josa.txt" ]) ],
  [ KoreanPos.Eomi, readWords([ "verb/eomi.txt" ]) ],
  [ KoreanPos.PreEomi, readWords([ "verb/pre_eomi.txt" ]) ],
  [ KoreanPos.Conjunction, readWords([ "auxiliary/conjunctions.txt" ]) ],
  [ KoreanPos.Modifier, readWords([ "substantives/modifier.txt" ]) ],
  [ KoreanPos.VerbPrefix, readWords([ "verb/verb_prefix.txt" ]) ],
  [ KoreanPos.Suffix, readWords([ "substantives/suffix.txt" ]) ],
]);

export const spamNouns = readWords([ "noun/spam.txt", "noun/profane.txt" ]);

export const properNouns = readWords([
  "noun/entities.txt",
  "noun/names.txt", "noun/twitter.txt", "noun/lol.txt", "noun/company_names.txt",
  "noun/foreign.txt", "noun/geolocations.txt",
  "substantives/given_names.txt", "noun/kpop.txt", "noun/bible.txt",
  "noun/pokemon.txt", "noun/congress.txt", "noun/wikipedia_title_nouns.txt"
]);

export const nameDictionary = {
  "family_name": readWords([ "substantives/family_names.txt" ]),
  "given_name": readWords([ "substantives/given_names.txt" ]),
  "full_name": readWords([ "noun/kpop.txt", "noun/foreign.txt", "noun/names.txt" ]),
};

const typoDictionary = readWordMap("typos/typos.txt");
export const typoDictionaryByLength: Map<number, Map<string, string>> = new Map()
typoDictionary.forEach((v, k) => {
  if(!typoDictionaryByLength.has(k.length)) {
    typoDictionaryByLength.set(k.length, new Map<string, string>());
  }
  
  typoDictionaryByLength.get(k.length).set(k, v);
});

function getConjugationMap(words: Set<string>, isAdjective: boolean): Map<string, string> {
  const map = new Map<string, string>();

  for(const [ word, _ ] of words.entries()) {
    const predicated = conjugatePredicated([ word ], isAdjective);
    for(const [ conjugated, _ ] of predicated.entries())
      map.set(conjugated, word + "다");
  }

  return map;
}

export const predicateStems = new Map([
  [ KoreanPos.Verb, getConjugationMap(readWords([ "verb/verb.txt" ]), false) ],
  [ KoreanPos.Adjective, getConjugationMap(readWords([ "adjective/adjective.txt" ]), true) ],
]);
