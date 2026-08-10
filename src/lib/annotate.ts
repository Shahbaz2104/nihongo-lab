import { tokenize, type Token } from "@/lib/tokenizer";
import { kanaToRomaji } from "@/lib/romaji";

export interface TokenSeg {
  text: string;
  reading: string;
}

export interface AnnotatedSentence {
  tokens: TokenSeg[];
  romaji: string;
}

export interface AnnotatedExample {
  ja: string;
  en: string;
  tokens: TokenSeg[];
  romaji: string;
}

const KANA_CHAR = /^[\u3040-\u30ff]$/;

function isKanaCharToken(t: Token): boolean {
  return t.type === "char" && KANA_CHAR.test(t.text);
}

function joinLine(tokens: Token[], format: (t: Token) => string): string {
  const withReading = tokens.filter((t) => t.reading);
  if (withReading.length === 0) return "";
  let out = format(withReading[0]);
  for (let i = 1; i < withReading.length; i++) {
    const prev = withReading[i - 1];
    const cur = withReading[i];
    const merged = isKanaCharToken(prev) || isKanaCharToken(cur);
    out += (merged ? "" : " ") + format(cur);
  }
  return out;
}

export function annotate(ja: string): AnnotatedSentence {
  const tokens = tokenize(ja);
  return {
    tokens: tokens.map((t) => ({ text: t.text, reading: t.reading })),
    romaji: joinLine(tokens, (t) => t.romaji),
  };
}

export function readingLine(ja: string): string {
  return joinLine(tokenize(ja), (t) => t.reading);
}

export function romajiOfKana(kana: string): string {
  return kanaToRomaji(kana);
}
