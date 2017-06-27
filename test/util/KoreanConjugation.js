const assert = require("assert");
const fs = require("fs");
const path = require("path");
const { conjugatePredicated } = require("../../build/util/KoreanConjugation");

const DATA_PATH = path.join(__dirname, "../data");

function matchGoldenset(predicate, newExpanded, examples) {
  const prevSet = new Set(examples.split(", "));
  const prevOnly = [];
  const newOnly = [];

  for(const word of prevSet) if(!newExpanded.has(word)) prevOnly.push(word);
  for(const word of newExpanded) if(!prevSet.has(word)) newOnly.push(word);

  console.error(`${predicate}:`);
  console.error(`  Previous Only: ${prevOnly.sort().join(", ")}`);
  console.error(`  New Only: ${newOnly.sort().join(", ")}`);

  return prevOnly.length === 0 && newOnly.length === 0;
}

function assertConjugations(filename, isAdjective) {
  const input = fs.readFileSync(path.join(DATA_PATH, filename), { encoding: "utf8" }).split("\n").filter(s => s.trim() !== "");
  const loaded = input.map(line => {
    const sp = line.split("\t");
    return [ sp[0], sp[1] ];
  });

  assert(loaded.reduce((output, [predicate, goldensetExpanded]) => matchGoldenset(
    predicate,
    conjugatePredicated(predicate, isAdjective),
    goldensetExpanded
  ), true));
}

describe("util/KoreanConjugation", function() {
  describe("#conjugatePredicated()", function() {
    it("should expand codas of verbs correctly", function() {
      assertConjugations("verb_conjugate.txt", false);
    });

    it("should expand codas of adjectives correctly", function() {
      assertConjugations("adj_conjugate.txt", true);
    });
  });
});
