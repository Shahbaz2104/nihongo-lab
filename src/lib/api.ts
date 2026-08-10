export type Grade = "again" | "hard" | "good" | "easy";

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

export interface Stats {
  totalCards: number;
  dueCards: number;
  todayReviews: number;
  todayAccuracy: number | null;
  byLevel: { level: string | null; _count: { _all: number } }[];
  history: { date: string; reviews: number; learned: number }[];
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
  quiz: (type: string, level: string, n = 10) =>
    fetch(`/api/quiz?type=${type}&level=${level}&n=${n}`).then((r) =>
      j<{ questions: QuizQuestion[] }>(r),
    ),
  stats: () => fetch("/api/stats").then((r) => j<Stats>(r)),
};
