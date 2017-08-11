const assert = require("assert");
const KoreanText = require("../build");

describe("KoreanText", function() {
  describe("#normalize()", function() {
    it("should correctly normalize", function() {
      // From OpenKoreanTextProcesserTest.scala
      assert.strictEqual(KoreanText.normalize("그랰ㅋㅋㅋㅋ 샤릉햌ㅋㅋ"), "그래ㅋㅋㅋ 사랑해ㅋㅋ");

      // From OpenKoreanTextProcesserJavaTest.java
      assert.strictEqual(KoreanText.normalize("힘들겟씀다 그래욬ㅋㅋㅋ"), "힘들겠습니다 그래요ㅋㅋㅋ");
    });
  });
  
  describe("#tokenize()", function() {
    it("should correctly tokenize", function() {
      assert.strictEqual(
        KoreanText.tokenize("착한강아지상을 받은 루루").join(", "),
        [ "착한(Adjective(착하다): 0, 2)",
          "강아지(Noun: 2, 3)", 
          "상(Suffix: 5, 1)",
          "을(Josa: 6, 1)", 
          " (Space: 7, 1)",
          "받은(Verb(받다): 8, 2)",
          " (Space: 10, 1)",
          "루루(Noun: 11, 2)" ].join(", ")
      );
  
      assert.strictEqual(
        KoreanText.tokenize("백여마리").join(", "),
        "백여(Modifier: 0, 2), 마리(Noun: 2, 2)"
      );
    });
  });
  
  describe("#tokensToStrings()", function() {
    it("should correctly convert tokens to strings", function() {
      const tokens = KoreanText.tokenize("착한강아지상을 받은 루루");
      
      assert.strictEqual(
        KoreanText.tokensToStrings(tokens, true).join(", "),
        "착한, 강아지, 상, 을,  , 받은,  , 루루"
      );

      assert.strictEqual(
        KoreanText.tokensToStrings(tokens, false).join(", "),
        "착한, 강아지, 상, 을, 받은, 루루"
      );
    });
  });
  
  describe("#addNounsToDictionary()", function() {
    it("should add nouns to the dictionary", function() {
      // From OpenKoreanTextProcesserJavaTest.java
      let tokens = KoreanText.tokenize("춍춍춍춍챵챵챵");
      assert.strictEqual(KoreanText.tokensToStrings(tokens).join(", "), "춍춍춍춍챵챵챵");

      KoreanText.addNounsToDictionary([ "춍춍", "챵챵챵" ]);

      tokens = KoreanText.tokenize("춍춍춍춍챵챵챵");
      assert.strictEqual(KoreanText.tokensToStrings(tokens).join(", "), "춍춍, 춍춍, 챵챵챵");
    });
  });
  
  describe("#extractPhrases()", function() {
    
  });
  
  describe("#splitSentences()", function() {
    it("should correctly split sentences", function() {
      assert.strictEqual(
        KoreanText.splitSentences("가을이다! 남자는 가을을 탄다...... 그렇지? 루루야! 버버리코트 사러 가자!!!!").join(", "),
        "가을이다!(0,5), 남자는 가을을 탄다......(6,22), 그렇지?(23,27), 루루야!(28,32), 버버리코트 사러 가자!!!!(33,48)"
      );
    });
  });
  
  describe("#detokenize()", function() {
    it("should correctly detokenize", function() {
      const words = [ "늘", "평온", "하게", "누워", "있", "는", "루루" ];
      assert.strictEqual(
        KoreanText.detokenize(words),
        "늘 평온하게 누워있는 루루"
      );
    });
  });
});
