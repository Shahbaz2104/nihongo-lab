import { readFileSync } from "node:fs";
import path from "node:path";
import { cache } from "react";
import { JLPT_LEVELS, type JlptLevel } from "@/lib/levels";

export type { JlptLevel };
export { JLPT_LEVELS };

export interface VocabItem {
  word: string;
  reading: string;
  meanings: string[];
  level: JlptLevel;
  examples: { ja: string; en: string }[];
  kanji?: string;
}

export interface KanjiItem {
  character: string;
  level: JlptLevel;
  strokes: number;
  grade: number;
  freq: number;
  onyomi: string[];
  kunyomi: string[];
  meanings: string[];
}

export interface GrammarItem {
  pattern: string;
  level: JlptLevel;
  meaning: string;
  formation: string;
  examples: { ja: string; en: string }[];
}

export interface KanaItem {
  type: "hiragana" | "katakana";
  char: string;
  romaji: string;
  group: string;
}

export function readJson<T>(rel: string): T {
  const file = readFileSync(path.join(process.cwd(), "data", rel), "utf8");
  return JSON.parse(file) as T;
}

function normalizeVocab(item: VocabItem): VocabItem {
  return { ...item, reading: item.reading || item.word };
}

export const getVocab = cache((level: JlptLevel): VocabItem[] =>
  readJson<VocabItem[]>(`vocab/${level.toLowerCase()}.json`).map(normalizeVocab),
);

export const getKanji = cache((level: JlptLevel): KanjiItem[] =>
  readJson<KanjiItem[]>(`kanji/${level.toLowerCase()}.json`),
);

export const getGrammar = cache((level: JlptLevel): GrammarItem[] =>
  readJson<GrammarItem[]>(`grammar/${level.toLowerCase()}.json`),
);

export const getKana = cache((): KanaItem[] => readJson<KanaItem[]>("kana.json"));
