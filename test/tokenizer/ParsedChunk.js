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
      assert.equal(parsedChunkWithUnknowns.countUnknowns, 2);
      assert.equal(parsedChunk.countUnknowns, 0);
    });

    it("should correctly count tokens", function() {
      assert.equal(parsedChunk.countTokens, 3);
      assert.equal(parsedChunkWithTwoTokens.countTokens, 2);
    });

    it("should correctly return unknown coverage", function() {
      assert.equal(parsedChunkWithUnknowns.getUnknownCoverage, 3);
      assert.equal(parsedChunkWithTwoTokens.getUnknownCoverage, 0);
    });

    it("should get correct frequency score", function() {
      assert.equal(parsedChunkWithTwoTokens.getFreqScore, 1.0);
      assert.equal(parsedChunkWithCommonNouns.getFreqScore, 0.4544);
    });

    it("should correctly count POSes", function() {
      assert.equal(parsedChunk.countPos(KoreanPos.Noun), 3);
      assert.equal(parsedChunkWithVerbs.countPos(KoreanPos.Noun), 1);
      assert.equal(parsedChunkWithVerbs.countPos(KoreanPos.Verb), 1);
    });

    it("should correctly determine if the chunk is an exact match", function() {
      assert.equal(parsedChunk.isExactMatch, 1);
      assert.equal(parsedChunkWithExactMatch.isExactMatch, 0);
    });

    it("should correctly determine if the chunk is all noun", function() {
      assert.equal(parsedChunk.isAllNouns, 0);
      assert.equal(parsedChunkWithVerbs.isAllNouns, 1);
    });
  });
});
