const assert = require("assert");
const { KoreanToken } = require("../../build/tokenizer/KoreanTokenizer");
const { isJosaAttachable, isName, isKoreanNumber, isKoreanNameVariation, collapseNouns } = require("../../build/util/KoreanSubstantive");
const { KoreanPos } = require("../../build/util/KoreanPos");

describe("util/KoreanSubstantive", function() {
  describe("#isJosaAttachable()", function() {
    it("should correctly determine if Josa is attachable", function() {
      //애플은
      assert.strictEqual(isJosaAttachable("플", "은"), true);
      assert.strictEqual(isJosaAttachable("플", "이"), true);
      assert.strictEqual(isJosaAttachable("플", "을"), true);
      assert.strictEqual(isJosaAttachable("플", "과"), true);
      assert.strictEqual(isJosaAttachable("플", "아"), true);

      //애플가
      assert.strictEqual(isJosaAttachable("플", "는"), false);
      assert.strictEqual(isJosaAttachable("플", "가"), false);
      assert.strictEqual(isJosaAttachable("플", "를"), false);
      assert.strictEqual(isJosaAttachable("플", "와"), false);
      assert.strictEqual(isJosaAttachable("플", "야"), false);
      assert.strictEqual(isJosaAttachable("플", "여"), false);
      assert.strictEqual(isJosaAttachable("플", "라"), false);

      //에프은
      assert.strictEqual(isJosaAttachable("프", "은"), false);
      assert.strictEqual(isJosaAttachable("프", "이"), false);
      assert.strictEqual(isJosaAttachable("프", "을"), false);
      assert.strictEqual(isJosaAttachable("프", "과"), false);
      assert.strictEqual(isJosaAttachable("프", "아"), false);

      //에프가
      assert.strictEqual(isJosaAttachable("프", "는"), true);
      assert.strictEqual(isJosaAttachable("프", "가"), true);
      assert.strictEqual(isJosaAttachable("프", "를"), true);
      assert.strictEqual(isJosaAttachable("프", "와"), true);
      assert.strictEqual(isJosaAttachable("프", "야"), true);
      assert.strictEqual(isJosaAttachable("프", "여"), true);
      assert.strictEqual(isJosaAttachable("프", "라"), true);
    });
  });

  describe("#isName()", function() {
    it("should return false if input length less than 3", function() {
      assert.strictEqual(isName("김"), false);
      assert.strictEqual(isName("관진"), false);
    });

    it("should correctly identify 3-char person names", function() {
      assert.strictEqual(isName("유호현"), true);
      assert.strictEqual(isName("김혜진"), true);
      assert.strictEqual(isName("개루루"), false);

      assert.strictEqual(isName("이상헌"), true);
      assert.strictEqual(isName("박수형"), true);

      assert.strictEqual(isName("이은별"), true);
      assert.strictEqual(isName("최종은"), true);

      assert.strictEqual(isName("박근혜"), true);
      assert.strictEqual(isName("손석희"), true);
      assert.strictEqual(isName("강철중"), true);

      assert.strictEqual(isName("사측의"), false);
      assert.strictEqual(isName("사다리"), false);
      assert.strictEqual(isName("철지난"), false);
      assert.strictEqual(isName("수용액"), false);
      assert.strictEqual(isName("눈맞춰"), false);
    });

    it("should correctly identify 4-char person names", function() {
      assert.strictEqual(isName("독고영재"), true);
      assert.strictEqual(isName("제갈경준"), true);
      assert.strictEqual(isName("유호현진"), false);
    });
  });

  describe("#isKoreanNumber()", function() {
    it("should return true if the text is a Korean number", function() {
      assert.strictEqual(isKoreanNumber("천이백만이십오"), true);
      assert.strictEqual(isKoreanNumber("이십"), true);
      assert.strictEqual(isKoreanNumber("오"), true);
      assert.strictEqual(isKoreanNumber("삼"), true);
    });

    it("should return false if the text is not a Korean number", function() {
      assert.strictEqual(isKoreanNumber("영삼"), false);
      assert.strictEqual(isKoreanNumber("이정"), false);
      assert.strictEqual(isKoreanNumber("조삼모사"), false);
    });
  });

  describe("#isKoreanNameVariation()", function() {
    it("should correctly identify removed null consonants", function() {
      assert.strictEqual(isKoreanNameVariation("호혀니"), true);
      assert.strictEqual(isKoreanNameVariation("혜지니"), true);
      assert.strictEqual(isKoreanNameVariation("빠수니"), true);
      assert.strictEqual(isKoreanNameVariation("은벼리"), true);
      assert.strictEqual(isKoreanNameVariation("귀여미"), true);
      assert.strictEqual(isKoreanNameVariation("루하니"), true);
      assert.strictEqual(isKoreanNameVariation("이오니"), true);

      assert.strictEqual(isKoreanNameVariation("이"), false);

      assert.strictEqual(isKoreanNameVariation("장미"), false);
      assert.strictEqual(isKoreanNameVariation("별이"), false);
      assert.strictEqual(isKoreanNameVariation("꼬치"), false);
      assert.strictEqual(isKoreanNameVariation("꽃이"), false);
      assert.strictEqual(isKoreanNameVariation("팔티"), false);
      assert.strictEqual(isKoreanNameVariation("감미"), false);
      assert.strictEqual(isKoreanNameVariation("고미"), false);

      assert.strictEqual(isKoreanNameVariation("가라찌"), false);
      assert.strictEqual(isKoreanNameVariation("귀요미"), false);
      assert.strictEqual(isKoreanNameVariation("사람이"), false);
      assert.strictEqual(isKoreanNameVariation("사람이니"), false);
      assert.strictEqual(isKoreanNameVariation("유하기"), false);
    });
  });

  describe("#collapseNouns()", function() {
    it("should collapse single-length nouns correctly", function() {
      assert.deepStrictEqual(
        collapseNouns([
          new KoreanToken("마", KoreanPos.Noun, 0, 1),
          new KoreanToken("코", KoreanPos.Noun, 1, 1),
          new KoreanToken("토", KoreanPos.Noun, 2, 1),
        ]),
        [ new KoreanToken("마코토", KoreanPos.Noun, 0, 3, undefined, true) ]
      );

      assert.deepStrictEqual(
        collapseNouns([
          new KoreanToken("마", KoreanPos.Noun, 0, 1),
          new KoreanToken("코", KoreanPos.Noun, 1, 1),
          new KoreanToken("토", KoreanPos.Noun, 2, 1),
          new KoreanToken("를", KoreanPos.Josa, 3, 1),
        ]),
        [ new KoreanToken("마코토", KoreanPos.Noun, 0, 3, undefined, true),
          new KoreanToken("를", KoreanPos.Josa, 3, 1) ]
      );

      assert.deepStrictEqual(
        collapseNouns([
          new KoreanToken("개", KoreanPos.Modifier, 0, 1),
          new KoreanToken("마", KoreanPos.Noun, 1, 1),
          new KoreanToken("코", KoreanPos.Noun, 2, 1),
          new KoreanToken("토", KoreanPos.Noun, 3, 1),
        ]),
        [ new KoreanToken("개", KoreanPos.Modifier, 0, 1),
          new KoreanToken("마코토", KoreanPos.Noun, 1, 3, undefined, true) ]
      );

      assert.deepStrictEqual(
        collapseNouns([
          new KoreanToken("마", KoreanPos.Noun, 0, 1),
          new KoreanToken("코", KoreanPos.Noun, 1, 1),
          new KoreanToken("토", KoreanPos.Noun, 2, 1),
          new KoreanToken("사람", KoreanPos.Noun, 3, 2),
        ]),
        [ new KoreanToken("마코토", KoreanPos.Noun, 0, 3, undefined, true),
          new KoreanToken("사람", KoreanPos.Noun, 3, 2) ]
      );

      assert.deepStrictEqual(
        collapseNouns([
          new KoreanToken("마", KoreanPos.Noun, 0, 1),
          new KoreanToken("코", KoreanPos.Noun, 1, 1),
          new KoreanToken("사람", KoreanPos.Noun, 2, 2),
          new KoreanToken("토", KoreanPos.Noun, 4, 1),
        ]),
        [ new KoreanToken("마코", KoreanPos.Noun, 0, 2, undefined, true),
          new KoreanToken("사람", KoreanPos.Noun, 2, 2),
          new KoreanToken("토", KoreanPos.Noun, 4, 1) ]
      );
    });
  });
});
