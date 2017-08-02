const assert = require("assert");
const { KoreanToken } = require("../../build/tokenizer/KoreanTokenizer");
const { isJosaAttachable, isName, isKoreanNumber, isKoreanNameVariation, collapseNouns } = require("../../build/util/KoreanSubstantive");
const { KoreanPos } = require("../../build/util/KoreanPos");

describe("util/KoreanSubstantive", function() {
  describe("#isJosaAttachable()", function() {
    it("should correctly determine if Josa is attachable", function() {
      //애플은
      assert.equal(isJosaAttachable("플", "은"), true);
      assert.equal(isJosaAttachable("플", "이"), true);
      assert.equal(isJosaAttachable("플", "을"), true);
      assert.equal(isJosaAttachable("플", "과"), true);
      assert.equal(isJosaAttachable("플", "아"), true);

      //애플가
      assert.equal(isJosaAttachable("플", "는"), false);
      assert.equal(isJosaAttachable("플", "가"), false);
      assert.equal(isJosaAttachable("플", "를"), false);
      assert.equal(isJosaAttachable("플", "와"), false);
      assert.equal(isJosaAttachable("플", "야"), false);
      assert.equal(isJosaAttachable("플", "여"), false);
      assert.equal(isJosaAttachable("플", "라"), false);

      //에프은
      assert.equal(isJosaAttachable("프", "은"), false);
      assert.equal(isJosaAttachable("프", "이"), false);
      assert.equal(isJosaAttachable("프", "을"), false);
      assert.equal(isJosaAttachable("프", "과"), false);
      assert.equal(isJosaAttachable("프", "아"), false);

      //에프가
      assert.equal(isJosaAttachable("프", "는"), true);
      assert.equal(isJosaAttachable("프", "가"), true);
      assert.equal(isJosaAttachable("프", "를"), true);
      assert.equal(isJosaAttachable("프", "와"), true);
      assert.equal(isJosaAttachable("프", "야"), true);
      assert.equal(isJosaAttachable("프", "여"), true);
      assert.equal(isJosaAttachable("프", "라"), true);
    });
  });

  describe("#isName()", function() {
    it("should return false if input length less than 3", function() {
      assert.equal(isName("김"), false);
      assert.equal(isName("관진"), false);
    });
    
    it("should correctly identify 3-char person names", function() {
      assert.equal(isName("유호현"), true);
      assert.equal(isName("김혜진"), true);
      assert.equal(isName("개루루"), false);

      assert.equal(isName("이상헌"), true);
      assert.equal(isName("박수형"), true);

      assert.equal(isName("이은별"), true);
      assert.equal(isName("최종은"), true);

      assert.equal(isName("박근혜"), true);
      assert.equal(isName("손석희"), true);
      assert.equal(isName("강철중"), true);

      assert.equal(isName("사측의"), false);
      assert.equal(isName("사다리"), false);
      assert.equal(isName("철지난"), false);
      assert.equal(isName("수용액"), false);
      assert.equal(isName("눈맞춰"), false);
    });

    it("should correctly identify 4-char person names", function() {
      assert.equal(isName("독고영재"), true);
      assert.equal(isName("제갈경준"), true);
      assert.equal(isName("유호현진"), false);
    });
  });

  describe("#isKoreanNumber()", function() {
    it("should return true if the text is a Korean number", function() {
      assert.equal(isKoreanNumber("천이백만이십오"), true);
      assert.equal(isKoreanNumber("이십"), true);
      assert.equal(isKoreanNumber("오"), true);
      assert.equal(isKoreanNumber("삼"), true);
    });

    it("should return false if the text is not a Korean number", function() {
      assert.equal(isKoreanNumber("영삼"), false);
      assert.equal(isKoreanNumber("이정"), false);
      assert.equal(isKoreanNumber("조삼모사"), false);
    });
  });

  describe("#isKoreanNameVariation()", function() {
    it("should correctly identify removed null consonants", function() {
      assert.equal(isKoreanNameVariation("호혀니"), true);
      assert.equal(isKoreanNameVariation("혜지니"), true);
      assert.equal(isKoreanNameVariation("빠수니"), true);
      assert.equal(isKoreanNameVariation("은벼리"), true);
      assert.equal(isKoreanNameVariation("귀여미"), true);
      assert.equal(isKoreanNameVariation("루하니"), true);
      assert.equal(isKoreanNameVariation("이오니"), true);

      assert.equal(isKoreanNameVariation("이"), false);

      assert.equal(isKoreanNameVariation("장미"), false);
      assert.equal(isKoreanNameVariation("별이"), false);
      assert.equal(isKoreanNameVariation("꼬치"), false);
      assert.equal(isKoreanNameVariation("꽃이"), false);
      assert.equal(isKoreanNameVariation("팔티"), false);
      assert.equal(isKoreanNameVariation("감미"), false);
      assert.equal(isKoreanNameVariation("고미"), false);

      assert.equal(isKoreanNameVariation("가라찌"), false);
      assert.equal(isKoreanNameVariation("귀요미"), false);
      assert.equal(isKoreanNameVariation("사람이"), false);
      assert.equal(isKoreanNameVariation("사람이니"), false);
      assert.equal(isKoreanNameVariation("유하기"), false);
    });
  });

  describe("#collapseNouns()", function() {
    it("should collapse single-length nouns correctly", function() {
      assert.deepEqual(
        collapseNouns([
          new KoreanToken("마", KoreanPos.Noun, 0, 1),
          new KoreanToken("코", KoreanPos.Noun, 1, 1),
          new KoreanToken("토", KoreanPos.Noun, 2, 1),
        ]),
        [ new KoreanToken("마코토", KoreanPos.Noun, 0, 3, undefined, true) ]
      );

      assert.deepEqual(
        collapseNouns([
          new KoreanToken("마", KoreanPos.Noun, 0, 1),
          new KoreanToken("코", KoreanPos.Noun, 1, 1),
          new KoreanToken("토", KoreanPos.Noun, 2, 1),
          new KoreanToken("를", KoreanPos.Josa, 3, 1),
        ]),
        [ new KoreanToken("마코토", KoreanPos.Noun, 0, 3, undefined, true),
          new KoreanToken("를", KoreanPos.Josa, 3, 1) ]
      );

      assert.deepEqual(
        collapseNouns([
          new KoreanToken("개", KoreanPos.Modifier, 0, 1),
          new KoreanToken("마", KoreanPos.Noun, 1, 1),
          new KoreanToken("코", KoreanPos.Noun, 2, 1),
          new KoreanToken("토", KoreanPos.Noun, 3, 1),
        ]),
        [ new KoreanToken("개", KoreanPos.Modifier, 0, 1),
          new KoreanToken("마코토", KoreanPos.Noun, 1, 3, undefined, true) ]
      );

      assert.deepEqual(
        collapseNouns([
          new KoreanToken("마", KoreanPos.Noun, 0, 1),
          new KoreanToken("코", KoreanPos.Noun, 1, 1),
          new KoreanToken("토", KoreanPos.Noun, 2, 1),
          new KoreanToken("사람", KoreanPos.Noun, 3, 2),
        ]),
        [ new KoreanToken("마코토", KoreanPos.Noun, 0, 3, undefined, true),
          new KoreanToken("사람", KoreanPos.Noun, 3, 2) ]
      );

      assert.deepEqual(
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
