import { describe, expect, it } from "vitest";
import { kanaToRomaji } from "./romaji";

describe("kanaToRomaji — CLAUDE.md reference cases", () => {
  it("basic words", () => {
    expect(kanaToRomaji("こんにちは")).toBe("konnichiha");
    expect(kanaToRomaji("がっこう")).toBe("gakkou");
    expect(kanaToRomaji("きょう")).toBe("kyou");
    expect(kanaToRomaji("しゃしん")).toBe("shashin");
    expect(kanaToRomaji("しゅくだい")).toBe("shukudai");
    expect(kanaToRomaji("ちょっと")).toBe("chotto");
    expect(kanaToRomaji("スーパー")).toBe("suupaa");
    expect(kanaToRomaji("コーヒー")).toBe("koohii");
  });
});

describe("kanaToRomaji — long vowels", () => {
  it("extends ー with the previous vowel", () => {
    expect(kanaToRomaji("スーパー")).toBe("suupaa");
    expect(kanaToRomaji("コーヒー")).toBe("koohii");
    expect(kanaToRomaji("おかあさん")).toBe("okaasan");
    expect(kanaToRomaji("とおい")).toBe("tooi");
  });
});

describe("kanaToRomaji — gemination", () => {
  it("doubles the following consonant", () => {
    expect(kanaToRomaji("がっこう")).toBe("gakkou");
    expect(kanaToRomaji("ちょっと")).toBe("chotto");
    expect(kanaToRomaji("きって")).toBe("kitte");
  });
});

describe("kanaToRomaji — yō-on", () => {
  it("combines small ya/yu/yo", () => {
    expect(kanaToRomaji("きゃ")).toBe("kya");
    expect(kanaToRomaji("しゃ")).toBe("sha");
    expect(kanaToRomaji("しゅ")).toBe("shu");
    expect(kanaToRomaji("しょ")).toBe("sho");
    expect(kanaToRomaji("ちゃ")).toBe("cha");
    expect(kanaToRomaji("じゅ")).toBe("ju");
    expect(kanaToRomaji("にゃ")).toBe("nya");
    expect(kanaToRomaji("りょう")).toBe("ryou");
  });
});

describe("kanaToRomaji — katakana and mixed input", () => {
  it("handles katakana", () => {
    expect(kanaToRomaji("アイスクリーム")).toBe("aisukuriimu");
  });

  it("passes through non-kana characters", () => {
    expect(kanaToRomaji("abc")).toBe("abc");
    expect(kanaToRomaji("。")).toBe("。");
    expect(kanaToRomaji("日本語")).toBe("日本語");
  });

  it("handles empty input", () => {
    expect(kanaToRomaji("")).toBe("");
  });
});

describe("kanaToRomaji — bare particles", () => {
  it("converts は/へ literally (context handled by the tokenizer)", () => {
    expect(kanaToRomaji("は")).toBe("ha");
    expect(kanaToRomaji("へ")).toBe("he");
  });
});