import { decomposeHangul, composeHangul, hasCoda } from "./Hangul";

/**
 * Expands Korean verbs and adjectives to all possible conjugation forms.
 */

// ㅋ, ㅎ for 잨ㅋㅋㅋㅋ 잔댛ㅎㅎㅎㅎ
const CODAS_COMMON = ["ㅂ", "ㅆ", "ㄹ", "ㄴ", "ㅁ"];
// 파랗다 -> 파래, 파램, 파랠, 파랬
const CODAS_FOR_CONTRACTION = ["ㅆ", "ㄹ", "ㅁ"];
const CODAS_NO_PAST = ["ㅂ", "ㄹ", "ㄴ", "ㅁ"];

const CODAS_SLANG_CONSONANT = ["ㅋ", "ㅎ"];
const CODAS_SLANG_VOWEL = ["ㅜ", "ㅠ"];

const PRE_EOMI_COMMON = [..."게겠고구기긴길네다더던도든면자잖재져죠지진질"];
const PRE_EOMI_1_1 = [..."야서써도준"];
const PRE_EOMI_1_2 = [..."어었"];
const PRE_EOMI_1_3 = [..."아았"];
const PRE_EOMI_1_4 = [..."워웠"];
const PRE_EOMI_1_5 = [..."여였"];

const PRE_EOMI_2 = [..."노느니냐"];
const PRE_EOMI_3 = [..."러려며"];
const PRE_EOMI_4 = [..."으"];
const PRE_EOMI_5 = [..."은"];
const PRE_EOMI_6 = [..."는"];
const PRE_EOMI_7 = [..."운"];

const PRE_EOMI_RESPECT = [..."세시실신셔습셨십"];

// 모음 어말어미
const PRE_EOMI_VOWEL = [].concat(PRE_EOMI_COMMON, PRE_EOMI_2, PRE_EOMI_3, PRE_EOMI_RESPECT);

function addPreEomi(lastChar: string, charsToAdd: string[]): string[] {
  return charsToAdd.map(c => lastChar + c);
}

/**
 * Conjugate adjectives and verbs.
 */
export function conjugatePredicated(words: string[] | Set<string>, isAdjective: boolean): Set<string> {
  const expanded: string[] = [];
  for(const word of words) {
    const init = word.substr(0, word.length - 1);
    const lastChar = word.substr(-1);
    const lastCharDecomposed = decomposeHangul(lastChar);

    const lastOnset = lastCharDecomposed.onset;
    const lastVowel = lastCharDecomposed.vowel;
    const lastCoda = lastCharDecomposed.coda;

    let expandedLast: string[];

    // Cases without codas
    if(lastChar === "하") {
      // 하다, special case
      const endings = [...(isAdjective ? "합해히하" : "합해")];
      expandedLast = [].concat(
        addPreEomi(lastChar, [].concat(PRE_EOMI_COMMON, PRE_EOMI_2, PRE_EOMI_6, PRE_EOMI_RESPECT)),
        CODAS_COMMON.map(coda => coda === "ㅆ" ? composeHangul("ㅎ", "ㅐ", coda) : composeHangul("ㅎ", "ㅏ", coda)),
        addPreEomi("하", [].concat(PRE_EOMI_VOWEL, PRE_EOMI_1_5, PRE_EOMI_6)),
        addPreEomi("해", PRE_EOMI_1_1),
        endings,
      );
    }
    // 쏘다
    else if(lastVowel === "ㅗ" && lastCoda === " ") {
      expandedLast = [].concat(
        addPreEomi(lastChar, [].concat(PRE_EOMI_VOWEL, PRE_EOMI_2, PRE_EOMI_1_3, PRE_EOMI_6)),
        CODAS_NO_PAST.map(coda => composeHangul(lastOnset, "ㅗ", coda)),
        [ composeHangul(lastOnset, "ㅘ"), composeHangul(lastOnset, "ㅘ", "ㅆ"), lastChar ],
      );
    }
    // 맞추다, 겨누다, 재우다,
    else if(lastVowel === "ㅜ" && lastCoda === " ") {
      expandedLast = [].concat(
        addPreEomi(lastChar, [].concat(PRE_EOMI_VOWEL, PRE_EOMI_1_2, PRE_EOMI_2, PRE_EOMI_6)),
        CODAS_NO_PAST.map(coda => composeHangul(lastOnset, "ㅜ", coda)),
        [ composeHangul(lastOnset, "ㅝ"), composeHangul(lastOnset, "ㅝ", "ㅆ"), lastChar ],
      );
    }
    // 치르다, 구르다, 굴르다, 뜨다, 모으다, 고르다, 골르다
    else if(lastVowel === "ㅡ" && lastCoda === " ") {
      expandedLast = [].concat(
        addPreEomi(lastChar, [].concat(PRE_EOMI_2, PRE_EOMI_6)),
        CODAS_NO_PAST.map(coda => composeHangul(lastOnset, "ㅡ", coda)),
        [ composeHangul(lastOnset, "ㅝ"), composeHangul(lastOnset, "ㅓ"), composeHangul(lastOnset, "ㅏ"), composeHangul(lastOnset, "ㅝ", "ㅆ"), composeHangul(lastOnset, "ㅓ", "ㅆ"), composeHangul(lastOnset, "ㅏ", "ㅆ"), lastChar ],
      );
    }
    // 사귀다
    else if(lastChar === "귀") {
      expandedLast = [].concat(
        addPreEomi(lastChar, [].concat(PRE_EOMI_2, PRE_EOMI_6)),
        CODAS_NO_PAST.map(coda => composeHangul("ㄱ", "ㅟ", coda)),
        [ "겨", "겼", lastChar ],
      );
    }
    // 쥐다
    else if(lastVowel === "ㅟ" && lastCoda === " ") {
      expandedLast = [].concat(
        CODAS_NO_PAST.map(coda => composeHangul(lastOnset, "ㅟ", coda)),
        addPreEomi(lastChar, [].concat(PRE_EOMI_2, PRE_EOMI_6)),
        [ lastChar ],
      );
    }
    // 마시다, 엎드리다, 치다, 이다, 아니다
    else if(lastVowel === "ㅣ" && lastCoda === " ") {
      expandedLast = [].concat(
        CODAS_NO_PAST.map(coda => composeHangul(lastOnset, "ㅣ", coda)),
        addPreEomi(lastChar, [].concat(PRE_EOMI_1_2, PRE_EOMI_2, PRE_EOMI_6)),
        [ composeHangul(lastOnset, "ㅣ", "ㅂ") + "니", composeHangul(lastOnset, "ㅕ"), composeHangul(lastOnset, "ㅕ", "ㅆ"), lastChar ],
      );
    }
    // 꿰다, 꾀다
    else if((lastVowel === "ㅞ" || lastVowel === "ㅚ" || lastVowel === "ㅙ") && lastCoda === " ") {
      expandedLast = [].concat(
        addPreEomi(lastChar, [].concat(PRE_EOMI_2, PRE_EOMI_6)),
        CODAS_COMMON.map(coda => composeHangul(lastOnset, lastVowel, coda)),
        [ lastChar ],
      );
    }
    // All other vowel endings: 둘러서다, 켜다, 세다, 캐다, 차다
    else if(lastCoda === " ") {
      expandedLast = [].concat(
        addPreEomi(lastChar, [].concat(PRE_EOMI_VOWEL, PRE_EOMI_1_1, PRE_EOMI_2, PRE_EOMI_6)),
        CODAS_COMMON.map(coda => composeHangul(lastOnset, lastVowel, coda)),
        [ lastChar ],
      );
    }
    // Cases with codas
    // 만들다, 알다, 풀다
    else if(lastCoda === "ㄹ" && ((lastOnset === "ㅁ" && lastVowel === "ㅓ") || lastVowel === "ㅡ" || lastVowel === "ㅏ" || lastVowel === "ㅜ")) {
      expandedLast = [].concat(
        addPreEomi(lastChar, [].concat(PRE_EOMI_1_2, PRE_EOMI_3)),
        addPreEomi(composeHangul(lastOnset, lastVowel), [].concat(PRE_EOMI_2, PRE_EOMI_6, PRE_EOMI_RESPECT)),
        [ composeHangul(lastOnset, lastVowel, "ㄻ"), composeHangul(lastOnset, lastVowel, "ㄴ"), lastChar ],
      );
    }
    // 낫다, 뺴앗다
    else if(lastVowel === "ㅏ" && lastCoda === "ㅅ") {
      expandedLast = [].concat(
        addPreEomi(lastChar, [].concat(PRE_EOMI_2, PRE_EOMI_6)),
        addPreEomi(composeHangul(lastOnset, "ㅏ"), [].concat(PRE_EOMI_4, PRE_EOMI_5)),
        [ lastChar ],
      );
    }
    // 묻다
    else if(lastChar === "묻") {
      expandedLast = [].concat(
        addPreEomi(lastChar, [].concat(PRE_EOMI_2, PRE_EOMI_6)),
        [ "물", lastChar ],
      );
    }
    // 붇다
    else if(lastVowel === "ㅜ" && lastCoda === "ㄷ") {
      expandedLast = [].concat(
        addPreEomi(lastChar, [].concat(PRE_EOMI_2, PRE_EOMI_6)),
        addPreEomi(composeHangul(lastOnset, "ㅜ"), [].concat(PRE_EOMI_1_2, PRE_EOMI_1_4, PRE_EOMI_4, PRE_EOMI_5)),
        [ composeHangul(lastOnset, "ㅜ", "ㄹ"), lastChar ],
      );
    }
    // 눕다
    else if(lastVowel === "ㅜ" && lastCoda === "ㅂ") {
      expandedLast = [].concat(
        addPreEomi(lastChar, [].concat(PRE_EOMI_2, PRE_EOMI_6)),
        addPreEomi(composeHangul(lastOnset, "ㅜ"), [].concat(PRE_EOMI_1_4, PRE_EOMI_4, PRE_EOMI_5)),
        [ lastChar ],
      );
    }
    // 간지럽다, 갑작스럽다 -> 갑작스런
    else if(lastVowel === "ㅓ" && lastCoda === "ㅂ" && isAdjective) {
      expandedLast = [].concat(
        addPreEomi(composeHangul(lastOnset, "ㅓ"), [].concat(PRE_EOMI_1_4, PRE_EOMI_7)),
        [ composeHangul(lastOnset, "ㅓ"), composeHangul(lastOnset, "ㅓ", "ㄴ"), lastChar ],
      );
    }
    // 아름답다, 가볍다, 덥다, 간지럽다
    else if(lastCoda === "ㅂ" && isAdjective) {
      expandedLast = [].concat(
        addPreEomi(composeHangul(lastOnset, lastVowel), [].concat(PRE_EOMI_1_4, PRE_EOMI_7)),
        [ composeHangul(lastOnset, lastVowel), lastChar ],
      );
    }
    // 놓다
    else if(lastVowel === "ㅗ" && lastCoda === "ㅎ") {
      expandedLast = [].concat(
        addPreEomi(lastChar, [].concat(PRE_EOMI_2, PRE_EOMI_6)),
        CODAS_COMMON.map(coda => composeHangul(lastOnset, "ㅗ", coda)),
        [ composeHangul(lastOnset, "ㅘ"), composeHangul(lastOnset, "ㅗ"), lastChar ],
      );
    }
    // 파랗다, 퍼렇다, 어떻다
    else if(lastCoda === "ㅎ" && isAdjective) {
      expandedLast = [].concat(
        CODAS_COMMON.map(coda => composeHangul(lastOnset, lastVowel, coda)),
        CODAS_FOR_CONTRACTION.map(coda => composeHangul(lastOnset, "ㅐ", coda)),
        [ composeHangul(lastOnset, "ㅐ"), composeHangul(lastOnset, lastVowel), lastChar ],
      );
    }
    // 1 char with coda adjective, 있다, 컸다
    else if(word.length == 1 || (isAdjective && lastCoda === "ㅆ")) {
      expandedLast = [].concat(
        addPreEomi(lastChar, [].concat(PRE_EOMI_COMMON, PRE_EOMI_1_2, PRE_EOMI_1_3, PRE_EOMI_2, PRE_EOMI_4, PRE_EOMI_5, PRE_EOMI_6)),
        [ lastChar ],
      );
    }
    // 1 char with coda adjective, 밝다
    else if(word.length == 1 && isAdjective) {
      expandedLast = [].concat(
        addPreEomi(lastChar, [].concat(PRE_EOMI_COMMON, PRE_EOMI_1_2, PRE_EOMI_1_3, PRE_EOMI_2, PRE_EOMI_4, PRE_EOMI_5)),
        [ lastChar ],
      );
    }
    // 부여잡다, 얻어맞다, 얻어먹다
    else { expandedLast = [ lastChar ]; }

    // -르 불규칙 (고르다 -> 골르다)
    let irregularExpansion = [];
    const initLast = init[init.length - 1];
    if(lastChar === "르" && !hasCoda(initLast)) {
      const lastInitCharDecomposed = decomposeHangul(initLast);
      const newInit = init.slice(0, -1) + composeHangul(lastInitCharDecomposed.onset, lastInitCharDecomposed.vowel, "ㄹ");

      const o = lastCharDecomposed.onset;
      const conjugation = [].concat(
        addPreEomi(lastChar, [].concat(PRE_EOMI_2, PRE_EOMI_6)),
        CODAS_NO_PAST.map(c => composeHangul(o, "ㅡ", c)),
        [ composeHangul(o, "ㅝ"), composeHangul(o, "ㅓ"), composeHangul(o, "ㅏ"), composeHangul(o, "ㅝ", "ㅆ"), composeHangul(o, "ㅓ", "ㅆ"), composeHangul(o, "ㅏ", "ㅆ"), lastChar ],
      );

      irregularExpansion = conjugation.map(s => newInit + s);
    }

    expanded.push.apply(expanded, expandedLast.map(s => init + s));
    expanded.push.apply(expanded, irregularExpansion);
  }

  const expandedSet = new Set(expanded);

  if(!isAdjective) {
    expandedSet.delete("아니");
    expandedSet.delete("입");
    expandedSet.delete("입니");
    expandedSet.delete("나는");
  }

  return expandedSet;
}
