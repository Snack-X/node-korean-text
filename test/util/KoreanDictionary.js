const assert = require("assert");
const { koreanDictionary, addWordsToDictionary } = require("../../build/util/KoreanDictionary");
const { KoreanPos } = require("../../build/util/KoreanPos");

describe("util/KoreanDictionary", function() {
  describe("#addWordsToDictionary()", function() {
    it("should add words to dictionary", function() {
      const nonExsistentWord = "없는명사다";

      assert.strictEqual(koreanDictionary.get(KoreanPos.Noun).has(nonExsistentWord), false);
      
      addWordsToDictionary(KoreanPos.Noun, [ nonExsistentWord ]);
      
      assert.strictEqual(koreanDictionary.get(KoreanPos.Noun).has(nonExsistentWord), true);
    });
  });
});
