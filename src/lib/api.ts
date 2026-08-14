export type Grade = "again" | "hard" | "good" | "easy";

import type { Token } from "@/lib/tokenizer";

export interface ReviewCard {
  id: string;
  front: string;
  back: string;
  reading: string | null;
  example: string | null;
  exampleFuri: string | null;
  type: string;
  level: string | null;
  status: number;
  interval: number;
  reps: number;
  isNew: boolean;
}

export interface QuizQuestion {
  prompt: string;
  answer: string;
  alt: string | null;
  options: string[];
}

export interface ListeningQuestion {
  jp: string;
  en: string;
  options: string[];
  answer: string;
  tokens: Token[];
}

export interface Stats {
  totalCards: number;
  dueCards: number;
  todayReviews: number;
  todayAccuracy: number | null;
  byLevel: { level: string | null; _count: { _all: number } }[];
  history: { date: string; reviews: number; learned: number }[];
  newWords: number;
  totalReviews: number;
  cardsLearned: number;
  learnedByType: { vocab: number; kanji: number; kana: number; grammar: number };
  levelProgress: { level: string; learned: number; total: number; pct: number }[];
}

export interface NewWord {
  word: string;
  kanji: string | null;
  reading: string;
  meanings: string[];
  example: string | null;
  exampleEn: string | null;
}

async function j<T>(res: Response): Promise<T> {
  if (!res.ok) throw new Error(`Request failed: ${res.status}`);
  return res.json() as Promise<T>;
}

export const api = {
  queue: (type: string, level: string, limit = 20) =>
    fetch(`/api/review/queue?type=${type}&level=${level}&limit=${limit}`).then((r) =>
      j<{ queue: ReviewCard[] }>(r),
    ),
  review: (cardId: string, grade: Grade) =>
    fetch("/api/review", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ cardId, grade }),
    }).then((r) => j<{ ok: boolean }>(r)),
  addCard: (input: {
    type: string;
    sourceId: string;
    front: string;
    back: string;
    reading: string | null;
    level?: string;
  }) =>
    fetch("/api/cards", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }).then((r) => j<{ ok: boolean; id: string; created: boolean }>(r)),
  quiz: (type: string, level: string, n = 10, direction?: string) =>
    fetch(
      `/api/quiz?type=${type}&level=${level}&n=${n}${direction ? `&direction=${direction}` : ""}`,
    ).then((r) => j<{ questions: QuizQuestion[] }>(r)),
  listening: (level: string, n = 5) =>
    fetch(`/api/listening?level=${level}&n=${n}`).then((r) =>
      j<{ questions: ListeningQuestion[] }>(r),
    ),
  stats: () => fetch("/api/stats").then((r) => j<Stats>(r)),
  sessionNewWords: (level: string, n = 5) =>
    fetch(`/api/session/newwords?level=${level}&n=${n}`).then((r) =>
      j<{ words: NewWord[] }>(r),
    ),
};
