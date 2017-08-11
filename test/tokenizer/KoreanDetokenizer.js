const assert = require("assert");
const { detokenize } = require("../../build/tokenizer/KoreanDetokenizer");

describe("tokenizer/KoreanDetokenizer", function() {
  describe("#detokenize", function() {
    it("should correctly detokenize the input text", function() {
      assert.strictEqual(
        detokenize([ "연세", "대학교", "보건", "대학원","에","오신","것","을","환영","합니다", "!" ]),
        "연세대학교 보건 대학원에 오신것을 환영합니다!"
      );
  
      assert.strictEqual(
        detokenize([ "와", "!!!", "iPhone", "6+", "가",",", "드디어","나왔다", "!" ]),
        "와!!! iPhone 6+ 가, 드디어 나왔다!"
      );
  
      assert.strictEqual(
        detokenize([ "뭐", "완벽", "하진", "않", "지만", "그럭저럭", "쓸", "만", "하군", "..." ]),
        "뭐 완벽하진 않지만 그럭저럭 쓸 만하군..."
      );
    });

    it("should correctly detokenize the edge cases", function() {
      assert.strictEqual(
        detokenize([ "" ]),
        ""
      );
  
      assert.strictEqual(
        detokenize([]),
        ""
      );
  
      assert.strictEqual(
        detokenize([ "완벽" ]),
        "완벽"
      );
  
      assert.strictEqual(
        detokenize([ "이" ]),
        "이"
      );
  
      assert.strictEqual(
        detokenize([ "이", "제품을", "사용하겠습니다" ]),
        "이 제품을 사용하겠습니다"
      );
    });
  });
});
