import { NextRequest, NextResponse } from "next/server";
import { getVocab, getKanji, getGrammar, JLPT_LEVELS, type JlptLevel } from "@/lib/datasets";
import { mulberry32, seededShuffle } from "@/lib/random";

export const dynamic = "force-dynamic";

function parseN(raw: string | null): number | null {
  if (raw === null) return 10;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(Math.floor(n), 30);
}

interface Question {
  prompt: string;
  answer: string;
  alt: string | null;
  options: string[];
}

function withDistractors(
  base: { prompt: string; answer: string; alt: string | null }[],
  pool: string[],
  rng: () => number,
): Question[] {
  const unique = [...new Set(pool.filter(Boolean))];
  return base.map((p) => {
    const distractors = seededShuffle(
      unique.filter((a) => a !== p.answer),
      rng,
    ).slice(0, 3);
    return { ...p, options: seededShuffle([...distractors, p.answer], rng) };
  });
}

const DIRECTIONS: Record<string, string[]> = {
  vocab: ["je", "ej"],
  kanji: ["km", "kr"],
  grammar: ["m"],
};

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "vocab";
  const level = (req.nextUrl.searchParams.get("level") ?? "N5").toUpperCase();
  const n = parseN(req.nextUrl.searchParams.get("n"));
  const direction = req.nextUrl.searchParams.get("direction") ?? "default";

  if (!["vocab", "kanji", "grammar"].includes(type) || !JLPT_LEVELS.includes(level as JlptLevel)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }
  if (n === null) {
    return NextResponse.json({ error: "Invalid n" }, { status: 400 });
  }
  const allowed = DIRECTIONS[type];
  const dir = direction === "default" ? allowed[0] : direction;
  if (!allowed.includes(dir)) {
    return NextResponse.json({ error: "Invalid direction" }, { status: 400 });
  }

  const seedRaw = req.nextUrl.searchParams.get("seed");
  const seed = seedRaw !== null ? Number(seedRaw) : Math.floor(Math.random() * 2 ** 32);
  const rng = Number.isFinite(seed) ? mulberry32(seed) : mulberry32(0);

  let questions: Question[] = [];

  if (type === "vocab") {
    const items = getVocab(level as JlptLevel);
    const picked = seededShuffle(items, rng).slice(0, n);
    if (dir === "ej") {
      const base = picked.map((i) => ({
        prompt: i.meanings[0] ?? i.word,
        answer: i.word,
        alt: i.reading || null,
      }));
      questions = withDistractors(base, items.map((i) => i.word), rng);
    } else {
      const base = picked.map((i) => ({
        prompt: i.word,
        answer: i.meanings[0] ?? i.word,
        alt: i.reading || null,
      }));
      questions = withDistractors(base, items.map((i) => i.meanings[0]), rng);
    }
    return NextResponse.json({ questions });
  }

  if (type === "kanji") {
    const items = getKanji(level as JlptLevel);
    const picked = seededShuffle(items, rng).slice(0, n);
    if (dir === "kr") {
      const base = picked.map((i) => ({
        prompt: i.character,
        answer: i.onyomi[0] ?? i.kunyomi[0] ?? i.character,
        alt: i.meanings[0] ?? null,
      }));
      const readings = items.flatMap((i) => [i.onyomi[0], i.kunyomi[0]]);
      questions = withDistractors(base, readings, rng);
    } else {
      const base = picked.map((i) => ({
        prompt: i.character,
        answer: i.meanings[0] ?? i.character,
        alt: i.onyomi[0] ?? null,
      }));
      questions = withDistractors(base, items.map((i) => i.meanings[0]), rng);
    }
    return NextResponse.json({ questions });
  }

  const items = getGrammar(level as JlptLevel);
  const picked = seededShuffle(items, rng).slice(0, n);
  const base = picked.map((i) => ({
    prompt: i.pattern,
    answer: i.meaning ?? i.pattern,
    alt: null,
  }));
  questions = withDistractors(base, items.map((i) => i.meaning), rng);
  return NextResponse.json({ questions });
}