const assert = require("assert");
const { KoreanPos } = require("../../build/util/KoreanPos");
const { ParsedChunk } = require("../../build/tokenizer/ParsedChunk");
const { KoreanToken } = require("../../build/tokenizer/KoreanTokenizer");

describe("tokenizer/ParsedChunk", function() {
  describe("#ParsedChunk", function() {
    const parsedChunk = new ParsedChunk(
      [ new KoreanToken("하", KoreanPos.Noun, 0, 0),
        new KoreanToken("하", KoreanPos.Noun, 0, 0),
        new KoreanToken("하", KoreanPos.Noun, 0, 0) ],
      1);

    const parsedChunkWithTwoTokens = new ParsedChunk(
      [ new KoreanToken("하", KoreanPos.Noun, 0, 0),
        new KoreanToken("하", KoreanPos.Noun, 0, 0) ],
      1);

    const parsedChunkWithUnknowns = new ParsedChunk(
      [ new KoreanToken("하하", KoreanPos.Noun, 0, 0, null, true),
        new KoreanToken("하", KoreanPos.Noun, 0, 0, null, true),
        new KoreanToken("하", KoreanPos.Noun, 0, 0) ],
      1);

    const parsedChunkWithCommonNouns = new ParsedChunk(
      [ new KoreanToken("사람", KoreanPos.Noun, 0, 0),
        new KoreanToken("강아지", KoreanPos.Noun, 0, 0) ],
      1);

    const parsedChunkWithVerbs = new ParsedChunk(
      [ new KoreanToken("사람", KoreanPos.Noun, 0, 0),
        new KoreanToken("하다", KoreanPos.Verb, 0, 0) ],
      1);

    const parsedChunkWithExactMatch = new ParsedChunk(
      [ new KoreanToken("강아지", KoreanPos.Noun, 0, 0) ],
      1);

    it("should correctly count unknowns", function() {
      assert.strictEqual(parsedChunkWithUnknowns.countUnknowns, 2);
      assert.strictEqual(parsedChunk.countUnknowns, 0);
    });

    it("should correctly count tokens", function() {
      assert.strictEqual(parsedChunk.countTokens, 3);
      assert.strictEqual(parsedChunkWithTwoTokens.countTokens, 2);
    });

    it("should correctly return unknown coverage", function() {
      assert.strictEqual(parsedChunkWithUnknowns.getUnknownCoverage, 3);
      assert.strictEqual(parsedChunkWithTwoTokens.getUnknownCoverage, 0);
    });

    it("should get correct frequency score", function() {
      assert.strictEqual(parsedChunkWithTwoTokens.getFreqScore, 1.0);
      assert.strictEqual(parsedChunkWithCommonNouns.getFreqScore, 0.4544);
    });

    it("should correctly count POSes", function() {
      assert.strictEqual(parsedChunk.countPos(KoreanPos.Noun), 3);
      assert.strictEqual(parsedChunkWithVerbs.countPos(KoreanPos.Noun), 1);
      assert.strictEqual(parsedChunkWithVerbs.countPos(KoreanPos.Verb), 1);
    });

    it("should correctly determine if the chunk is an exact match", function() {
      assert.strictEqual(parsedChunk.isExactMatch, 1);
      assert.strictEqual(parsedChunkWithExactMatch.isExactMatch, 0);
    });

    it("should correctly determine if the chunk is all noun", function() {
      assert.strictEqual(parsedChunk.isAllNouns, 0);
      assert.strictEqual(parsedChunkWithVerbs.isAllNouns, 1);
    });
  });
});
