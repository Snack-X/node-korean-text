const assert = require("assert");
const { split } = require("../../build/tokenizer/KoreanSentenceSplitter");

describe("tokenizer/KoreanSentenceSplitter", function() {
  describe("#split", function() {
    it("should correctly split a string into sentences", function() {
      assert.strictEqual(
        split("안녕? iphone6안녕? 세상아?").join("/"),
        "안녕?(0,3)/iphone6안녕?(4,14)/세상아?(15,19)"
      );

      assert.strictEqual(
        split("그런데, 누가 그러는데, 루루가 있대. 그렇대? 그렇지! 아리고 이럴수가!!!!! 그래...").join("/"),
        "그런데, 누가 그러는데, 루루가 있대.(0,21)/그렇대?(22,26)/그렇지!(27,31)/아리고 이럴수가!!!!!(32,45)/그래...(46,51)"
      );

      assert.strictEqual(
        split("이게 말이 돼?! 으하하하 ㅋㅋㅋㅋㅋㅋㅋ…    ").join("/"),
        "이게 말이 돼?!(0,9)/으하하하 ㅋㅋㅋㅋㅋㅋㅋ…(10,23)"
      );
    });
  });
});
