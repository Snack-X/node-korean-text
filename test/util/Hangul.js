const assert = require("assert");
const { decomposeHangul, hasCoda, composeHangul } = require("../../build/util/Hangul");

describe("util/Hangul", function() {
  describe("#decomposeHangul()", function() {
    it("should decompose full Korean chars correctly", function() {
      assert.deepStrictEqual(decomposeHangul("간"), { onset: "ㄱ", vowel: "ㅏ", coda: "ㄴ" });
      assert.deepStrictEqual(decomposeHangul("관"), { onset: "ㄱ", vowel: "ㅘ", coda: "ㄴ" });
      assert.deepStrictEqual(decomposeHangul("꼃"), { onset: "ㄲ", vowel: "ㅕ", coda: "ㅀ" });
    });

    it("should decompose full no coda chars correctly", function() {
      assert.deepStrictEqual(decomposeHangul("가"), { onset: "ㄱ", vowel: "ㅏ", coda: " " });
      assert.deepStrictEqual(decomposeHangul("과"), { onset: "ㄱ", vowel: "ㅘ", coda: " " });
      assert.deepStrictEqual(decomposeHangul("껴"), { onset: "ㄲ", vowel: "ㅕ", coda: " " });
    });
  });

  describe("#hasCoda()", function() {
    it("should return true when a character has a coda", function() {
      assert.strictEqual(hasCoda("갈"), true);
      assert.strictEqual(hasCoda("갉"), true);
    });

    it("should return false when a character does not have a coda", function() {
      assert.strictEqual(hasCoda("가"), false);
      assert.strictEqual(hasCoda("ㄱ"), false);
      assert.strictEqual(hasCoda("ㅘ"), false);
      assert.strictEqual(hasCoda(" "), false);
    });
  });

  describe("#composeHangul()", function() {
    it("should compose a full Korean char from a triple of letters", function() {
      assert.strictEqual(composeHangul("ㄱ", "ㅏ", "ㄷ"), "갇");
      assert.strictEqual(composeHangul("ㄲ", "ㅑ", "ㅀ"), "꺓");
      assert.strictEqual(composeHangul("ㅊ", "ㅘ", "ㄴ"), "촨");
    });

    it("should compose a no-coda Korean char from a triple of letters", function() {
      assert.strictEqual(composeHangul("ㄱ", "ㅏ", " "), "가");
      assert.strictEqual(composeHangul("ㄲ", "ㅑ", " "), "꺄");
      assert.strictEqual(composeHangul("ㅊ", "ㅘ", " "), "촤");
    });
  });
});
