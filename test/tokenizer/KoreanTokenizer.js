const assert = require("assert");
const { tokenize, KoreanToken, tokenizeTopN } = require("../../build/tokenizer/KoreanTokenizer");
const { koreanDictionary, addWordsToDictionary } = require("../../build/util/KoreanDictionary");
const { KoreanPos } = require("../../build/util/KoreanPos");

describe("tokenizer/KoreanTokenizer", function() {
  describe("#tokenize", function() {
    it("should return expected tokens", function() {
      assert.deepStrictEqual(
        tokenize("개루루야"),
        [ new KoreanToken("개", KoreanPos.Noun, 0, 1),
          new KoreanToken("루루", KoreanPos.Noun, 1, 2),
          new KoreanToken("야", KoreanPos.Josa, 3, 1) ]
      );

      assert.deepStrictEqual(
        tokenize("쵸귀여운"),
        [ new KoreanToken("쵸", KoreanPos.VerbPrefix, 0, 1),
          new KoreanToken("귀여운", KoreanPos.Adjective, 1, 3, "귀엽다") ]
      );

      assert.deepStrictEqual(
        tokenize("이사람의"),
        [ new KoreanToken("이", KoreanPos.Determiner, 0, 1),
          new KoreanToken("사람", KoreanPos.Noun, 1, 2),
          new KoreanToken("의", KoreanPos.Josa, 3, 1) ]
      );

      assert.deepStrictEqual(
        tokenize("엄청작아서귀엽다"),
        [ new KoreanToken("엄청", KoreanPos.Adverb, 0, 2),
          new KoreanToken("작아서", KoreanPos.Adjective, 2, 3, "작다"),
          new KoreanToken("귀엽다", KoreanPos.Adjective, 5, 3, "귀엽다") ]
      );

      assert.deepStrictEqual(
        tokenize("안녕하셨어요"),
        [ new KoreanToken("안녕하셨어요", KoreanPos.Adjective, 0, 6, "안녕하다") ]
      );

      assert.deepStrictEqual(
        tokenize("쵸귀여운개루루"),
        [ new KoreanToken("쵸", KoreanPos.VerbPrefix, 0, 1),
          new KoreanToken("귀여운", KoreanPos.Adjective, 1, 3, "귀엽다"),
          new KoreanToken("개", KoreanPos.Noun, 4, 1),
          new KoreanToken("루루", KoreanPos.Noun, 5, 2) ]
      );

      assert.deepStrictEqual(
        tokenize("그리고"),
        [ new KoreanToken("그리고", KoreanPos.Conjunction, 0, 3) ]
      );

      assert.deepStrictEqual(
        tokenize("안녕ㅋㅋ"),
        [ new KoreanToken("안녕", KoreanPos.Noun, 0, 2),
          new KoreanToken("ㅋㅋ", KoreanPos.KoreanParticle, 2, 2) ]
      );

      assert.deepStrictEqual(
        tokenize("라고만"),
        [ new KoreanToken("라고만", KoreanPos.Eomi, 0, 3) ]
      );
    });

    it("should handle edge cases", function() {
      assert.deepStrictEqual(
        tokenize("이승기가"),
        [ new KoreanToken("이승기", KoreanPos.Noun, 0, 3),
          new KoreanToken("가", KoreanPos.Josa, 3, 1) ]
      );

      assert.strictEqual(
        tokenize("야이건뭐").join(", "),
        "야(Exclamation: 0, 1), 이건(Noun: 1, 2), 뭐(Noun: 3, 1)"
      );

      assert.strictEqual(
        tokenize("아이럴수가").join(", "),
        "아(Exclamation: 0, 1), 이럴수가(Adjective(이렇다): 1, 4)"
      );

      assert.strictEqual(
        tokenize("보다가").join(", "),
        "보다가(Verb(보다): 0, 3)"
      );

      assert.strictEqual(
        tokenize("하...").join(", "),
        "하(Exclamation: 0, 1), ...(Punctuation: 1, 3)"
      );

      assert.strictEqual(
        tokenize("시전하는").join(", "),
        "시전(Noun: 0, 2), 하는(Verb(하다): 2, 2)"
      );
    });

    it("should be able to tokenize long non-space-correctable ones", function() {
      assert.strictEqual(
        tokenize("훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌").map(t => t.text).join(" "),
        "훌쩍 훌쩍 훌쩍 훌쩍 훌쩍 훌쩍 훌쩍 훌쩍 훌쩍 훌쩍 훌쩍 훌쩍 " +
        "훌쩍 훌쩍 훌쩍 훌쩍 훌쩍 훌쩍 훌쩍 훌쩍 훌쩍 훌쩍 훌쩍 훌쩍 훌"
      );
    });

    it("should properly tokenize edge cases", function() {
      assert.strictEqual(
        tokenize("해쵸쵸쵸쵸쵸쵸쵸쵸춏").join(" "),
        "해쵸쵸쵸쵸쵸쵸쵸쵸춏*(Noun: 0, 10)"
      );
    });

    it("should add user-added nouns to dictionary", function() {
      assert.strictEqual(koreanDictionary.get(KoreanPos.Noun).has("뇬뇨"), false);
      assert.strictEqual(koreanDictionary.get(KoreanPos.Noun).has("츄쵸"), false);
  
      assert.strictEqual(
        tokenize("뇬뇨뇬뇨뇬뇨뇬뇨츄쵸").join(" "),
        "뇬뇨뇬뇨뇬뇨뇬뇨*(Noun: 0, 8) 츄쵸*(Noun: 8, 2)"
      );

      addWordsToDictionary(KoreanPos.Noun, [ "뇬뇨", "츄쵸" ]);

      assert.strictEqual(koreanDictionary.get(KoreanPos.Noun).has("뇬뇨"), true);
      assert.strictEqual(koreanDictionary.get(KoreanPos.Noun).has("츄쵸"), true);
      
      assert.strictEqual(
        tokenize("뇬뇨뇬뇨뇬뇨뇬뇨츄쵸").join(" "),
        "뇬뇨(Noun: 0, 2) 뇬뇨(Noun: 2, 2) 뇬뇨(Noun: 4, 2) 뇬뇨(Noun: 6, 2) 츄쵸(Noun: 8, 2)"
      );
    });
  });
});
