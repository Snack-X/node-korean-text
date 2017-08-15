const assert = require("assert");
const { findAllPatterns, getChunks, getChunksByPos, chunk } = require("../../build/tokenizer/KoreanChunker");
const { KoreanPos } = require("../../build/util/KoreanPos");

describe("tokenizer/KoreanChunker", function() {
  describe("#getChunks()", function() {
    it("should correctly split a string into Korean-sensitive chunks", function() {
      assert.strictEqual(
        getChunks("안녕? iphone6안녕? 세상아?").join("/"),
        "안녕/?/ /iphone/6/안녕/?/ /세상아/?"
      );

      assert.strictEqual(
        getChunks("This is an 한국어가 섞인 English tweet.").join("/"),
        "This/ /is/ /an/ /한국어가/ /섞인/ /English/ /tweet/."
      );

      assert.strictEqual(
        getChunks("이 日本것은 日本語Eng").join("/"),
        "이/ /日本/것은/ /日本語/Eng"
      );

      assert.strictEqual(
        getChunks("무효이며").join("/"),
        "무효이며"
      );

      assert.strictEqual(
        getChunks("#해쉬태그 이라는 것 #hash @hello 123 이런이런 #여자최애캐_5명으로_취향을_드러내자").join("/"),
        "#해쉬태그/ /이라는/ /것/ /#hash/ /@hello/ /123/ /이런이런/ /#여자최애캐_5명으로_취향을_드러내자"
      );
    });

    it("should correctly extract numbers", function() {
      assert.strictEqual(
        getChunks("300위안짜리 밥").join("/"),
        "300위안/짜리/ /밥"
      );

      assert.strictEqual(
        getChunks("200달러와 300유로").join("/"),
        "200달러/와/ /300유로"
      );

      assert.strictEqual(
        getChunks("$200이나 한다").join("/"),
        "$200/이나/ /한다"
      );

      assert.strictEqual(
        getChunks("300옌이었다.").join("/"),
        "300옌/이었다/."
      );

      assert.strictEqual(
        getChunks("3,453,123,123원 3억3천만원").join("/"),
        "3,453,123,123원/ /3억/3천만원"
      );

      assert.strictEqual(
        getChunks("6/4 지방 선거").join("/"),
        "6/4/ /지방/ /선거"
      );

      assert.strictEqual(
        getChunks("6.4 지방 선거").join("/"),
        "6.4/ /지방/ /선거"
      );

      assert.strictEqual(
        getChunks("6-4 지방 선거").join("/"),
        "6-4/ /지방/ /선거"
      );

      assert.strictEqual(
        getChunks("6.25 전쟁").join("/"),
        "6.25/ /전쟁"
      );

      assert.strictEqual(
        getChunks("1998년 5월 28일").join("/"),
        "1998년/ /5월/ /28일"
      );

      assert.strictEqual(
        getChunks("62:45의 결과").join("/"),
        "62:45/의/ /결과"
      );

      assert.strictEqual(
        getChunks("여러 칸  띄어쓰기,   하나의 Space묶음으로 처리됩니다.").join("/"),
        "여러/ /칸/  /띄어쓰기/,/   /하나의/ /Space/묶음으로/ /처리됩니다/."
      );
    });
  });


  describe("#getChunksByPos()", function() {
    it("should correctly extract chunks with a POS tag", function() {
      assert.strictEqual(
        getChunksByPos("openkoreantext.org에서 API를 테스트 할 수 있습니다.", KoreanPos.URL).join("/"),
        "openkoreantext.org(URL: 0, 18)"
      );
      
      assert.strictEqual(
        getChunksByPos("메일 주소 mechanickim@openkoreantext.org로 문의주시거나", KoreanPos.Email).join("/"),
        "mechanickim@openkoreantext.org(Email: 6, 30)"
      );
      
      assert.strictEqual(
        getChunksByPos("open-korean-text 프로젝트 마스터 @nlpenguin님께 메일주시면 됩니다. :-)", KoreanPos.ScreenName).join("/"),
        "@nlpenguin(ScreenName: 26, 10)"
      );
      
      assert.strictEqual(
        getChunksByPos("해시태그는 이렇게 생겼습니다. #나는_해적왕이_될_사나이다", KoreanPos.Hashtag).join("/"),
        "#나는_해적왕이_될_사나이다(Hashtag: 17, 15)"
      );
      
      assert.strictEqual(
        getChunksByPos("캐쉬태그는 주식정보 트윗할 때 사용합니다. $twtr", KoreanPos.CashTag).join("/"),
        "$twtr(CashTag: 24, 5)"
      );
      
      assert.strictEqual(
        getChunksByPos("Black action solier 출두요~!", KoreanPos.Korean).join("/"),
        "출두요(Korean: 20, 3)"
      );
      
      assert.strictEqual(
        getChunksByPos("Black action solier 출두요~! ㅋㅋ", KoreanPos.KoreanParticle).join("/"),
        "ㅋㅋ(KoreanParticle: 26, 2)"
      );
      
      assert.strictEqual(
        getChunksByPos("최근 발매된 게임 '13일의 금요일'은 43,000원에 스팀에서 판매중입니다.", KoreanPos.Number).join("/"),
        "13일(Number: 11, 3)/43,000원(Number: 22, 7)"
      );
      
      assert.strictEqual(
        getChunksByPos("드래곤볼 Z", KoreanPos.Alpha).join("/"),
        "Z(Alpha: 5, 1)"
      );
      
      assert.strictEqual(
        getChunksByPos("나의 일기장 안에 모든 말을 다 꺼내어 줄 순 없지만... 사랑한다는 말 이에요.", KoreanPos.Punctuation).join("/"),
        "...(Punctuation: 29, 3)/.(Punctuation: 44, 1)"
      );
    });
  });

  describe("#chunk()", function() {
    it("should correctly find chunks with correct POS tags", function() {
      assert.strictEqual(
        chunk("한국어와 English와 1234와 pic.twitter.com " +
          "http://news.kukinews.com/article/view.asp?" +
          "page=1&gCode=soc&arcid=0008599913&code=41121111 " +
          "hohyonryu@twitter.com 갤럭시 S5").join("/"),
        "한국어와(Korean: 0, 4)/ (Space: 4, 1)/English(Alpha: 5, 7)/와(Korean: 12, 1)/" +
          " (Space: 13, 1)/1234(Number: 14, 4)/와(Korean: 18, 1)/ (Space: 19, 1)/" +
          "pic.twitter.com(URL: 20, 15)/ (Space: 35, 1)/http://news.kukinews.com/" +
          "article/view.asp?page=1&gCode=soc&arcid=0008599913&code=41121111(URL: 36, 89)/" +
          " (Space: 125, 1)/hohyonryu@twitter.com(Email: 126, 21)/ (Space: 147, 1)/" +
          "갤럭시(Korean: 148, 3)/ (Space: 151, 1)/S(Alpha: 152, 1)/5(Number: 153, 1)"
      )

      assert.strictEqual(
        chunk("우와!!! 완전ㅋㅋㅋㅋ").join("/"),
        "우와(Korean: 0, 2)/!!!(Punctuation: 2, 3)/ (Space: 5, 1)/완전(Korean: 6, 2)/" +
          "ㅋㅋㅋㅋ(KoreanParticle: 8, 4)"
      )

      assert.strictEqual(
        chunk("@nlpenguin @edeng #korean_tokenizer_rocks 우하하").join("/"),
        "@nlpenguin(ScreenName: 0, 10)/ (Space: 10, 1)/@edeng(ScreenName: 11, 6)/" +
          " (Space: 17, 1)/#korean_tokenizer_rocks(Hashtag: 18, 23)/ (Space: 41, 1)/" +
          "우하하(Korean: 42, 3)"
      )
    });

    it("should correctly detect Korean-specific punctuations.", function() {
      assert.strictEqual(
        chunk("중·고등학교에서…").join("/"),
        "중(Korean: 0, 1)/·(Punctuation: 1, 1)/고등학교에서(Korean: 2, 6)/…(Punctuation: 8, 1)"
      )
    });
  });
});
