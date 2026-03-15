import { describe, it, expect } from "vitest";
import { matchesKanaRomaji, normalizeInput } from "./kana";

describe("normalizeInput", () => {
    it("converts full-width lowercase romaji to half-width", () => {
        expect(normalizeInput("ｓｙ")).toBe("sy");
    });

    it("converts full-width uppercase romaji to half-width lowercase", () => {
        expect(normalizeInput("ＳＹＡ")).toBe("sya");
    });

    it("converts ASCII uppercase to lowercase", () => {
        expect(normalizeInput("SYA")).toBe("sya");
    });

    it("converts hiragana to katakana", () => {
        expect(normalizeInput("しゃんでら")).toBe("シャンデラ");
    });

    it("converts half-width katakana to full-width", () => {
        expect(normalizeInput("ｱｲｳ")).toBe("アイウ");
    });

    it("converts half-width katakana with dakuten", () => {
        expect(normalizeInput("ｶﾞｷﾞ")).toBe("ガギ");
        expect(normalizeInput("ｼﾞ")).toBe("ジ");
        expect(normalizeInput("ｳﾞ")).toBe("ヴ");
    });

    it("converts half-width katakana with handakuten", () => {
        expect(normalizeInput("ﾊﾟﾋﾟ")).toBe("パピ");
    });

    it("handles mixed input", () => {
        expect(normalizeInput("しｬン")).toBe("シャン");
    });

    it("preserves already-normalized input", () => {
        expect(normalizeInput("abc")).toBe("abc");
        expect(normalizeInput("シャンデラ")).toBe("シャンデラ");
    });

    it("preserves special characters", () => {
        expect(normalizeInput("♀♂")).toBe("♀♂");
        expect(normalizeInput("-")).toBe("-");
    });

    it("handles half-width katakana without valid combining mark", () => {
        // ン followed by dakuten mark — ン doesn't combine, dakuten passes through
        expect(normalizeInput("ﾝﾞ")).toBe("ン\uFF9E");
    });
});

describe("matchesKanaRomaji", () => {
    describe("empty input", () => {
        it("matches any target", () => {
            expect(matchesKanaRomaji("", "フシギダネ")).toBe(true);
        });
    });

    describe("katakana prefix matching", () => {
        it("matches exact katakana", () => {
            expect(matchesKanaRomaji("フシギダネ", "フシギダネ")).toBe(true);
        });

        it("matches katakana prefix", () => {
            expect(matchesKanaRomaji("フシギ", "フシギダネ")).toBe(true);
        });

        it("rejects when input is longer than target", () => {
            expect(matchesKanaRomaji("フシギダネダネ", "フシギダネ")).toBe(false);
        });

        it("rejects non-matching katakana", () => {
            expect(matchesKanaRomaji("ピカ", "フシギダネ")).toBe(false);
        });
    });

    describe("hiragana matching", () => {
        it("matches hiragana input against katakana target", () => {
            expect(matchesKanaRomaji("しゃんでら", "シャンデラ")).toBe(true);
        });

        it("matches hiragana prefix", () => {
            expect(matchesKanaRomaji("ふしぎ", "フシギダネ")).toBe(true);
        });
    });

    describe("half-width katakana matching", () => {
        it("matches half-width katakana with dakuten", () => {
            expect(matchesKanaRomaji("ｼｬﾝﾃﾞﾗ", "シャンデラ")).toBe(true);
        });

        it("matches half-width katakana prefix", () => {
            expect(matchesKanaRomaji("ﾌｼｷﾞ", "フシギダネ")).toBe(true);
        });
    });

    describe("romaji full matching", () => {
        it("matches syandera -> シャンデラ", () => {
            expect(matchesKanaRomaji("syandera", "シャンデラ")).toBe(true);
        });

        it("matches syandela -> シャンデラ (la = ラ)", () => {
            expect(matchesKanaRomaji("syandela", "シャンデラ")).toBe(true);
        });

        it("matches shandera -> シャンデラ", () => {
            expect(matchesKanaRomaji("shandera", "シャンデラ")).toBe(true);
        });

        it("matches hushigidane -> フシギダネ", () => {
            expect(matchesKanaRomaji("husigidane", "フシギダネ")).toBe(true);
        });

        it("matches pikachuu -> ピカチュウ", () => {
            expect(matchesKanaRomaji("pikachuu", "ピカチュウ")).toBe(true);
            expect(matchesKanaRomaji("pikatyuu", "ピカチュウ")).toBe(true);
            expect(matchesKanaRomaji("pikacyuu", "ピカチュウ")).toBe(true);
        });
    });

    describe("romaji prefix matching", () => {
        it("matches 's' -> シャンデラ", () => {
            expect(matchesKanaRomaji("s", "シャンデラ")).toBe(true);
        });

        it("matches 'sy' -> シャンデラ", () => {
            expect(matchesKanaRomaji("sy", "シャンデラ")).toBe(true);
        });

        it("matches 'sya' -> シャンデラ", () => {
            expect(matchesKanaRomaji("sya", "シャンデラ")).toBe(true);
        });

        it("matches 'syan' -> シャンデラ", () => {
            expect(matchesKanaRomaji("syan", "シャンデラ")).toBe(true);
        });

        it("matches 'sha' -> シャンデラ", () => {
            expect(matchesKanaRomaji("sha", "シャンデラ")).toBe(true);
        });

        it("matches 'c' -> シャンデラ (ci = シ)", () => {
            expect(matchesKanaRomaji("c", "シャンデラ")).toBe(true);
        });

        it("matches 'ci' -> シャンデラ", () => {
            expect(matchesKanaRomaji("ci", "シャンデラ")).toBe(true);
        });
    });

    describe("mixed kana + romaji (mid-typing)", () => {
        it("matches しゃんd -> シャンデラ", () => {
            expect(matchesKanaRomaji("しゃんd", "シャンデラ")).toBe(true);
        });

        it("matches シャンd -> シャンデラ", () => {
            expect(matchesKanaRomaji("シャンd", "シャンデラ")).toBe(true);
        });

        it("matches フシギd -> フシギダネ", () => {
            expect(matchesKanaRomaji("フシギd", "フシギダネ")).toBe(true);
        });

        it("matches しｬン -> シャンデラ", () => {
            expect(matchesKanaRomaji("しｬン", "シャンデラ")).toBe(true);
        });
    });

    describe("full-width romaji", () => {
        it("matches ｓｙ -> シャンデラ", () => {
            expect(matchesKanaRomaji("ｓｙ", "シャンデラ")).toBe(true);
        });

        it("matches ｓ -> シャンデラ", () => {
            expect(matchesKanaRomaji("ｓ", "シャンデラ")).toBe(true);
        });

        it("matches ｃ -> シャンデラ", () => {
            expect(matchesKanaRomaji("ｃ", "シャンデラ")).toBe(true);
        });
    });

    describe("ン handling", () => {
        it("matches shann as prefix (nn partial for ン)", () => {
            expect(matchesKanaRomaji("shann", "シャンデラ")).toBe(true);
        });

        it("matches single n before consonant (n before d)", () => {
            // "shand" = sha(シャ) + n(ン, valid before d) + d(prefix of de=デ)
            expect(matchesKanaRomaji("shand", "シャンデラ")).toBe(true);
        });

        it("matches san as prefix for サンド (n before d)", () => {
            expect(matchesKanaRomaji("san", "サンド")).toBe(true);
        });

        it("matches sando for サンド", () => {
            expect(matchesKanaRomaji("sando", "サンド")).toBe(true);
        });

        it("requires nn for ン before ナ行 (ムンナ)", () => {
            // "munna" = mu(ム) + nn(ン) + a(ア?) — fails because target has ナ not ア
            expect(matchesKanaRomaji("munna", "ムンナ")).toBe(false);
            // "munnna" = mu(ム) + nn(ン) + na(ナ) — correct
            expect(matchesKanaRomaji("munnna", "ムンナ")).toBe(true);
        });

        it("requires nn for ン before ヤ行", () => {
            // ヤンヤンマ = ヤ ン ヤ ン マ
            // "yannyanma" = ya(ヤ) + nn(ン) + ya(ヤ) + n(ン, valid before m) + ma(マ)
            expect(matchesKanaRomaji("yannyanma", "ヤンヤンマ")).toBe(true);
            // Single n before ヤ should fail for ン
            // "yanyanma" would try: ya(ヤ) + n(ン?) — but n before ヤ is ambiguous
            expect(matchesKanaRomaji("yanyanma", "ヤンヤンマ")).toBe(false);
        });

        it("matches n at end of input as prefix of nn", () => {
            // "n" could be start of "nn" for ン
            expect(matchesKanaRomaji("n", "ンデラ")).toBe(true);
        });

        it("allows single n for ン at end of target", () => {
            expect(matchesKanaRomaji("nn", "ン")).toBe(true);
            expect(matchesKanaRomaji("n", "ン")).toBe(true);
        });
    });

    describe("ッ (sokuon/geminate) handling", () => {
        it("matches poppo -> ポッポ", () => {
            expect(matchesKanaRomaji("poppo", "ポッポ")).toBe(true);
        });

        it("matches geminate prefix: kamek -> カメックス", () => {
            // "kamek" = ka(カ) + me(メ) + k(prefix of kk for ック...)
            expect(matchesKanaRomaji("kamek", "カメックス")).toBe(true);
        });

        it("matches kamekkusu -> カメックス", () => {
            expect(matchesKanaRomaji("kamekkusu", "カメックス")).toBe(true);
        });

        it("matches zubatto -> ズバット", () => {
            expect(matchesKanaRomaji("zubatto", "ズバット")).toBe(true);
        });

        it("matches standalone ッ with xtu", () => {
            expect(matchesKanaRomaji("kaxtuka", "カッカ")).toBe(true);
            expect(matchesKanaRomaji("kaltu", "カッ")).toBe(true);
        });

        it("matches ッ + digraph (geminate + combined kana)", () => {
            // ッシャ: ss + sha, ss + sya
            expect(matchesKanaRomaji("ssha", "ッシャ")).toBe(true);
            expect(matchesKanaRomaji("ssya", "ッシャ")).toBe(true);
        });

        it("matches koratt as prefix for コラッタ", () => {
            expect(matchesKanaRomaji("koratt", "コラッタ")).toBe(true);
        });
    });

    describe("ー (long vowel mark)", () => {
        it("matches a-bo -> アーボ", () => {
            expect(matchesKanaRomaji("a-bo", "アーボ")).toBe(true);
        });

        it("matches a- as prefix", () => {
            expect(matchesKanaRomaji("a-", "アーボ")).toBe(true);
        });

        it("matches アー as prefix", () => {
            expect(matchesKanaRomaji("アー", "アーボ")).toBe(true);
        });

        it("matches faiya- -> ファイヤー", () => {
            expect(matchesKanaRomaji("faiya-", "ファイヤー")).toBe(true);
        });
    });

    describe("modern digraphs", () => {
        it("matches thi for ティ", () => {
            expect(matchesKanaRomaji("thi", "ティ")).toBe(true);
        });

        it("matches dhi for ディ", () => {
            expect(matchesKanaRomaji("dhi", "ディ")).toBe(true);
        });

        it("matches fa for ファ", () => {
            expect(matchesKanaRomaji("fa", "ファ")).toBe(true);
        });

        it("matches fi for フィ", () => {
            expect(matchesKanaRomaji("fi", "フィオネ")).toBe(true);
        });

        it("matches texi for ティ (te + xi = テ + ィ)", () => {
            expect(matchesKanaRomaji("texi", "ティ")).toBe(true);
        });

        it("matches vu for ヴ", () => {
            expect(matchesKanaRomaji("vu", "ヴ")).toBe(true);
        });
    });

    describe("l ambiguity (l = x for small kana, l = ra-row)", () => {
        it("matches la as ラ", () => {
            expect(matchesKanaRomaji("la", "ラッタ")).toBe(true);
        });

        it("matches la as ァ", () => {
            expect(matchesKanaRomaji("la", "ァ")).toBe(true);
        });

        it("matches lya as リャ digraph", () => {
            expect(matchesKanaRomaji("lya", "リャ")).toBe(true);
        });

        it("matches lya as small ャ", () => {
            expect(matchesKanaRomaji("lya", "ャ")).toBe(true);
        });
    });

    describe("special characters in names", () => {
        it("matches prefix before special char", () => {
            expect(matchesKanaRomaji("nidoran", "ニドラン♀")).toBe(true);
        });

        it("matches with special char included", () => {
            expect(matchesKanaRomaji("nidoran♀", "ニドラン♀")).toBe(true);
        });

        it("rejects wrong special char", () => {
            expect(matchesKanaRomaji("nidoran♂", "ニドラン♀")).toBe(false);
        });
    });

    describe("♂/♀ reading support", () => {
        it("matches にどらんおす -> ニドラン♂ (hiragana reading)", () => {
            expect(matchesKanaRomaji("にどらんおす", "ニドラン♂")).toBe(true);
        });

        it("matches にどらんめす -> ニドラン♀ (hiragana reading)", () => {
            expect(matchesKanaRomaji("にどらんめす", "ニドラン♀")).toBe(true);
        });

        it("matches katakana reading オス -> ♂", () => {
            expect(matchesKanaRomaji("ニドランオス", "ニドラン♂")).toBe(true);
        });

        it("matches katakana reading メス -> ♀", () => {
            expect(matchesKanaRomaji("ニドランメス", "ニドラン♀")).toBe(true);
        });

        it("matches romaji reading osu -> ♂", () => {
            expect(matchesKanaRomaji("nidoranosu", "ニドラン♂")).toBe(true);
        });

        it("matches romaji reading mesu -> ♀", () => {
            expect(matchesKanaRomaji("nidoranmesu", "ニドラン♀")).toBe(true);
        });

        it("matches partial reading as prefix", () => {
            expect(matchesKanaRomaji("にどらんお", "ニドラン♂")).toBe(true);
            expect(matchesKanaRomaji("にどらんめ", "ニドラン♀")).toBe(true);
        });

        it("matches romaji prefix of reading", () => {
            expect(matchesKanaRomaji("nidorano", "ニドラン♂")).toBe(true);
            expect(matchesKanaRomaji("nidoranme", "ニドラン♀")).toBe(true);
        });

        it("matches mixed kana + romaji for reading", () => {
            expect(matchesKanaRomaji("ニドランo", "ニドラン♂")).toBe(true);
            expect(matchesKanaRomaji("にどらんos", "ニドラン♂")).toBe(true);
        });

        it("still matches literal ♂/♀", () => {
            expect(matchesKanaRomaji("nidoran♂", "ニドラン♂")).toBe(true);
            expect(matchesKanaRomaji("nidoran♀", "ニドラン♀")).toBe(true);
        });

        it("rejects wrong reading", () => {
            expect(matchesKanaRomaji("にどらんめす", "ニドラン♂")).toBe(false);
            expect(matchesKanaRomaji("にどらんおす", "ニドラン♀")).toBe(false);
        });
    });

    describe("negative cases", () => {
        it("rejects completely unrelated input", () => {
            expect(matchesKanaRomaji("pikachu", "フシギダネ")).toBe(false);
        });

        it("rejects when romaji doesn't match target start", () => {
            expect(matchesKanaRomaji("x", "フシギダネ")).toBe(false);
        });

        it("rejects partial romaji that doesn't match", () => {
            expect(matchesKanaRomaji("abc", "アーボ")).toBe(false);
        });
    });

    describe("real Pokemon name examples", () => {
        it("matches various inputs for リザードン", () => {
            expect(matchesKanaRomaji("riza", "リザードン")).toBe(true);
            expect(matchesKanaRomaji("liza", "リザードン")).toBe(true);
            expect(matchesKanaRomaji("riza-donn", "リザードン")).toBe(true);
            expect(matchesKanaRomaji("riza-don", "リザードン")).toBe(true);
            expect(matchesKanaRomaji("リザ", "リザードン")).toBe(true);
            expect(matchesKanaRomaji("りざ", "リザードン")).toBe(true);
        });

        it("matches various inputs for ギャラドス", () => {
            expect(matchesKanaRomaji("gya", "ギャラドス")).toBe(true);
            expect(matchesKanaRomaji("gyaradosu", "ギャラドス")).toBe(true);
        });

        it("matches various inputs for デンヂムシ", () => {
            expect(matchesKanaRomaji("dendimusi", "デンヂムシ")).toBe(true);
            expect(matchesKanaRomaji("denndimusi", "デンヂムシ")).toBe(true);
        });
    });

    describe("hiragana targets (nature names)", () => {
        it("matches hiragana input against hiragana target", () => {
            expect(matchesKanaRomaji("いじっぱり", "いじっぱり")).toBe(true);
            expect(matchesKanaRomaji("いじ", "いじっぱり")).toBe(true);
        });

        it("matches katakana input against hiragana target", () => {
            expect(matchesKanaRomaji("イジッパリ", "いじっぱり")).toBe(true);
        });

        it("matches romaji against hiragana target", () => {
            expect(matchesKanaRomaji("ijippari", "いじっぱり")).toBe(true);
            expect(matchesKanaRomaji("iji", "いじっぱり")).toBe(true);
        });

        it("matches romaji prefix against hiragana target", () => {
            expect(matchesKanaRomaji("hi", "ひかえめ")).toBe(true);
            expect(matchesKanaRomaji("hik", "ひかえめ")).toBe(true);
            expect(matchesKanaRomaji("hikaeme", "ひかえめ")).toBe(true);
        });

        it("matches mixed input against hiragana target", () => {
            expect(matchesKanaRomaji("おくび", "おくびょう")).toBe(true);
            expect(matchesKanaRomaji("おくb", "おくびょう")).toBe(true);
        });

        it("rejects non-matching romaji against hiragana target", () => {
            expect(matchesKanaRomaji("ganba", "いじっぱり")).toBe(false);
        });
    });
});
