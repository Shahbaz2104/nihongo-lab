import { describe, expect, it } from "vitest";
import { tokenize } from "./tokenizer";

function readings(sentence: string): string[] {
  return tokenize(sentence).map((t) => `${t.text}|${t.reading}|${t.type}`);
}

describe("tokenizer — CLAUDE.md reference sentences", () => {
  it("今日は学校へ行きました。", () => {
    expect(readings("今日は学校へ行きました。")).toEqual([
      "今日|きょう|word",
      "は|は|particle",
      "学校|がっこう|word",
      "へ|へ|particle",
      "行きました|いきました|word",
      "。||char",
    ]);
  });

  it("昨日東京に行ってきました。", () => {
    expect(readings("昨日東京に行ってきました。")).toEqual([
      "昨日|きのう|word",
      "東京|とうきょう|word",
      "に|に|particle",
      "行ってきました|いってきました|word",
      "。||char",
    ]);
  });

  it("日本語を勉強しています。", () => {
    expect(readings("日本語を勉強しています。")).toEqual([
      "日本語|にほんご|word",
      "を|を|particle",
      "勉強しています|べんきょうしている|word",
      "。||char",
    ]);
  });

  it("毎朝コーヒーを飲みます。", () => {
    expect(readings("毎朝コーヒーを飲みます。")).toEqual([
      "毎朝|まいあさ|word",
      "コーヒー|コーヒー|word",
      "を|を|particle",
      "飲みます|のみます|word",
      "。||char",
    ]);
  });

  it("六時半に起きます。", () => {
    expect(readings("六時半に起きます。")).toEqual([
      "六時|ろくじ|word",
      "半|はん|word",
      "に|に|particle",
      "起きます|おきます|word",
      "。||char",
    ]);
  });

  it("彼女は本を読んでいます。", () => {
    expect(readings("彼女は本を読んでいます。")).toEqual([
      "彼女|かのじょ|word",
      "は|は|particle",
      "本|ほん|word",
      "を|を|particle",
      "読んでいます|よんでいます|word",
      "。||char",
    ]);
  });

  it("この本はおもしろくありません。", () => {
    expect(readings("この本はおもしろくありません。")).toEqual([
      "この|この|word",
      "本|ほん|word",
      "は|は|particle",
      "おもしろくありません|おもしろくありません|word",
      "。||char",
    ]);
  });

  it("日本へ行きたいです。", () => {
    expect(readings("日本へ行きたいです。")).toEqual([
      "日本|にほん|word",
      "へ|へ|particle",
      "行きたいです|いきたいです|word",
      "。||char",
    ]);
  });

  it("一緒に映画を見ませんか。", () => {
    expect(readings("一緒に映画を見ませんか。")).toEqual([
      "一緒|いっしょ|word",
      "に|に|particle",
      "映画|えいが|word",
      "を|を|particle",
      "見ません|みません|word",
      "か|か|particle",
      "。||char",
    ]);
  });

  it("食べられませんでした。", () => {
    expect(readings("食べられませんでした。")).toEqual([
      "食べられませんでした|たべられませんでした|word",
      "。||char",
    ]);
  });
});

describe("tokenizer — edge cases", () => {
  it("standalone greeting 今日は reads こんにちは", () => {
    const [t] = tokenize("今日は。");
    expect(t.reading).toBe("こんにちは");
    expect(t.romaji).toBe("konnichiwa");
  });

  it("particles は and へ use context romaji", () => {
    const tokens = tokenize("学校へ行きます。");
    const he = tokens.find((t) => t.text === "へ");
    expect(he?.romaji).toBe("e");
    const wa = tokenize("本は面白い。").find((t) => t.text === "は");
    expect(wa?.romaji).toBe("wa");
  });

  it("unknown single kanji falls back with a kunyomi reading", () => {
    const tokens = tokenize("食べられませんでした。");
    const food = tokens.find((t) => t.text === "食べられませんでした");
    expect(food?.reading).toBe("たべられませんでした");
  });

  it("kanji fallback prefers normalized kunyomi over onyomi", () => {
    // 見 is not a vocab word, so the fallback fires: kunyomi み.る normalizes to みる.
    const [standalone] = tokenize("見。");
    expect(standalone.reading).toBe("みる");
    expect(standalone.romaji).toBe("miru");
  });

  it("punctuation and whitespace produce bare char tokens", () => {
    const tokens = tokenize("こんにちは！");
    expect(tokens.at(-1)?.text).toBe("！");
    expect(tokens.at(-1)?.reading).toBe("");
  });

  it("does not emit meaning for particles", () => {
    const wa = tokenize("これは本です。").find((t) => t.text === "は");
    expect(wa?.meanings).toEqual(["topic marker"]);
  });
});
