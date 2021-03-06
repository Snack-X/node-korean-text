const assert = require("assert");
const { KoreanPos, buildTrie, selfNode } = require("../../build/util/KoreanPos");

describe("util/KoreanPos", function() {
  describe("#buildTrie()", function() {
    it("should build Trie correctly for initial optionals with final non-optionals", function() {
      // 0 -> 1
      assert.deepStrictEqual(buildTrie("m0N1", KoreanPos.Noun), [
        { curPos: KoreanPos.Modifier, nextTrie: [
          { curPos: KoreanPos.Noun, nextTrie: [], ending: KoreanPos.Noun }
        ], ending: null },
        { curPos: KoreanPos.Noun, nextTrie: [], ending: KoreanPos.Noun }
      ]);

      // * -> +
      assert.deepStrictEqual(buildTrie("m*N+", KoreanPos.Noun), [
        { curPos: KoreanPos.Modifier, nextTrie: [
          selfNode,
          { curPos: KoreanPos.Noun, nextTrie: [ selfNode ], ending: KoreanPos.Noun }
        ], ending: null },
        { curPos: KoreanPos.Noun, nextTrie: [ selfNode ], ending: KoreanPos.Noun }
      ]);
    });

    it("should build Trie correctly for initial optionals with multiple non-optionals", function() {
      // 0 -> 0 -> 1
      assert.deepStrictEqual(buildTrie("m0N0s1", KoreanPos.Noun), [
        { curPos: KoreanPos.Modifier, nextTrie: [
          { curPos: KoreanPos.Noun, nextTrie: [
            { curPos: KoreanPos.Suffix, nextTrie: [], ending: KoreanPos.Noun },
          ], ending: null },
          { curPos: KoreanPos.Suffix, nextTrie: [], ending: KoreanPos.Noun },
        ], ending: null },
        { curPos: KoreanPos.Noun, nextTrie: [
          { curPos: KoreanPos.Suffix, nextTrie: [], ending: KoreanPos.Noun },
        ], ending: null },
        { curPos: KoreanPos.Suffix, nextTrie: [], ending: KoreanPos.Noun },
      ])
    });

    it("should build Trie correctly for initial non-optionals with final non-optionals", function() {
      // 1 -> +
      assert.deepStrictEqual(buildTrie("m1N+", KoreanPos.Noun), [
        { curPos: KoreanPos.Modifier, nextTrie: [
          { curPos: KoreanPos.Noun, nextTrie: [
            selfNode
          ], ending: KoreanPos.Noun }
        ], ending: null }
      ]);

      // + -> 1
      assert.deepStrictEqual(buildTrie("N+s1", KoreanPos.Noun), [
        { curPos: KoreanPos.Noun, nextTrie: [
          selfNode,
          { curPos: KoreanPos.Suffix, nextTrie: [], ending: KoreanPos.Noun }
        ], ending: null }
      ]);
    });

    it("should build Trie correctly for initial non-optionals with final optionals", function() {
      // 1 -> *
      assert.deepStrictEqual(buildTrie("m1N*", KoreanPos.Noun), [
        { curPos: KoreanPos.Modifier, nextTrie: [
          { curPos: KoreanPos.Noun, nextTrie: [
            selfNode
          ], ending: KoreanPos.Noun }
        ], ending: KoreanPos.Noun }
      ]);

      // + -> 0
      assert.deepStrictEqual(buildTrie("N+s0", KoreanPos.Noun), [
        { curPos: KoreanPos.Noun, nextTrie: [
          selfNode,
          { curPos: KoreanPos.Suffix, nextTrie: [], ending: KoreanPos.Noun }
        ], ending: KoreanPos.Noun }
      ]);
    });

    it("should build Trie correctly for initial non-optionals with multiple non-optionals", function() {
      // + -> + -> 0
      assert.deepStrictEqual(buildTrie("A+V+A0", KoreanPos.Verb), [
        { curPos: KoreanPos.Adverb, nextTrie: [
          selfNode,
          { curPos: KoreanPos.Verb, nextTrie: [
            selfNode,
            { curPos: KoreanPos.Adverb, nextTrie: [], ending: KoreanPos.Verb }
          ], ending: KoreanPos.Verb }
        ], ending: null }
      ]);
    });
  });
});
