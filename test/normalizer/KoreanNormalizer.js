const assert = require("assert");
const { normalize, normalizeCodaN, correctTypo } = require("../../build/normalizer/KoreanNormalizer");

describe("normalizer/KoreanNormalizer", function() {
  describe("#normalize()", function() {
    it("should normalize ㅋㅋ ㅎㅎ ㅠㅜ chunks", function() {
      assert.equal(normalize("안됔ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ내 심장을 가격했엌ㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋㅋ"), "안돼ㅋㅋㅋ내 심장을 가격했어ㅋㅋㅋ")
      assert.equal(normalize("무의식중에 손들어버려섴ㅋㅋㅋㅋ"), "무의식중에 손들어버려서ㅋㅋㅋ")
      assert.equal(normalize("기억도 나지아낳ㅎㅎㅎ"), "기억도 나지아나ㅎㅎㅎ")
      assert.equal(normalize("근데비싸서못머구뮤ㅠㅠ"), "근데비싸서못먹음ㅠㅠ")

      assert.equal(normalize("미친 존잘니뮤ㅠㅠㅠㅠ"), "미친 존잘님ㅠㅠㅠ")
      assert.equal(normalize("만나무ㅜㅜㅠ"), "만남ㅜㅜㅠ")
      assert.equal(normalize("가루ㅜㅜㅜㅜ"), "가루ㅜㅜㅜ")

      assert.equal(normalize("유성우ㅠㅠㅠ"), "유성우ㅠㅠㅠ")

      assert.equal(normalize("예뿌ㅠㅠ"), "예뻐ㅠㅠ")
      assert.equal(normalize("고수야고수ㅠㅠ"), "고수야고수ㅠㅠ")
    });

    it("should normalize repeated chunks", function() {
      assert.equal(normalize("땡큐우우우우우우"), "땡큐우우우")
      assert.equal(normalize("구오오오오오오오오옹오오오"), "구오오오옹오오오")
    });

    it("should normalize repeated 2-letters", function() {
      assert.equal(normalize("훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍훌쩍"), "훌쩍훌쩍")
      assert.equal(normalize("ㅋㅎㅋㅎㅋㅎㅋㅎㅋㅎㅋㅎ"), "ㅋㅎㅋㅎ")
    });

    it("should not normalize non-Korean chunks", function() {
      assert.equal(normalize("http://11111.cccccom soooooooo !!!!!!!!!!!!!!!"), "http://11111.cccccom soooooooo !!!!!!!!!!!!!!!")
    });


    it("should have correctTypo integrated", function() {
      assert.equal(normalize("가쟝 용기있는 사람이 머굼 되는거즤"), "가장 용기있는 사람이 먹음 되는거지")
    });

    it("should have normalizeCodaN integrated", function() {
      assert.equal(normalize("오노딘가"), "오노디인가")
      assert.equal(normalize("관곈지"), "관계인지")
      assert.equal(normalize("생각하는건데"), "생각하는건데")
    });
  });

  describe("#normalizeCodaN()", function() {
    it("should normalize coda N nouns correctly", function() {
      assert.equal(normalizeCodaN("오노딘가"), "오노디인가")
      assert.equal(normalizeCodaN("소린가"), "소리인가")
      // Unknown noun
      assert.equal(normalizeCodaN("쵸킨데"), "쵸킨데")
    });

    it("should not normalize if the input is known in the dictionary", function() {
      assert.equal(normalizeCodaN("누군가"), "누군가")
      assert.equal(normalizeCodaN("군가"), "군가")
    });

    it("should not normalize if the input is an adjective or a verb", function() {
      assert.equal(normalizeCodaN("가는건데"), "가는건데")
      assert.equal(normalizeCodaN("곤란한데"), "곤란한데")
      assert.equal(normalizeCodaN("생각하는건데"), "생각하는건데")
    });
  });

  describe("#correctTypo()", function() {
    it("should correct typos", function() {
      assert.equal(correctTypo("가쟝 용기있는 사람이 머굼 되는거즤"), "가장 용기있는 사람이 먹음 되는거지")
      assert.equal(correctTypo("만듀 먹것니? 먹겄서? 먹즤?"), "만두 먹겠니? 먹겠어? 먹지?")
    });
  });
});
