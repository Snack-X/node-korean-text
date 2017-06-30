const assert = require("assert");
const { decomposeHangul, hasCoda, composeHangul } = require("../../build/util/Hangul");

describe("util/Hangul", function() {
  describe("#decomposeHangul()", function() {
    it("should decompose full Korean chars correctly", function() {
      assert.deepEqual(decomposeHangul("간"), { onset: "ㄱ", vowel: "ㅏ", coda: "ㄴ" });
      assert.deepEqual(decomposeHangul("관"), { onset: "ㄱ", vowel: "ㅘ", coda: "ㄴ" });
      assert.deepEqual(decomposeHangul("꼃"), { onset: "ㄲ", vowel: "ㅕ", coda: "ㅀ" });
    });

    it("should decompose full no coda chars correctly", function() {
      assert.deepEqual(decomposeHangul("가"), { onset: "ㄱ", vowel: "ㅏ", coda: " " });
      assert.deepEqual(decomposeHangul("과"), { onset: "ㄱ", vowel: "ㅘ", coda: " " });
      assert.deepEqual(decomposeHangul("껴"), { onset: "ㄲ", vowel: "ㅕ", coda: " " });
    });
  });

  describe("#hasCoda()", function() {
    it("should return true when a character has a coda", function() {
      assert.equal(hasCoda("갈"), true);
      assert.equal(hasCoda("갉"), true);
    });

    it("should return false when a character does not have a coda", function() {
      assert.equal(hasCoda("가"), false);
      assert.equal(hasCoda("ㄱ"), false);
      assert.equal(hasCoda("ㅘ"), false);
      assert.equal(hasCoda(" "), false);
    });
  });

  describe("#composeHangul()", function() {
    it("should compose a full Korean char from a triple of letters", function() {
      assert.equal(composeHangul("ㄱ", "ㅏ", "ㄷ"), "갇");
      assert.equal(composeHangul("ㄲ", "ㅑ", "ㅀ"), "꺓");
      assert.equal(composeHangul("ㅊ", "ㅘ", "ㄴ"), "촨");
    });

    it("should compose a no-coda Korean char from a triple of letters", function() {
      assert.equal(composeHangul("ㄱ", "ㅏ", " "), "가");
      assert.equal(composeHangul("ㄲ", "ㅑ", " "), "꺄");
      assert.equal(composeHangul("ㅊ", "ㅘ", " "), "촤");
    });
  });
});
