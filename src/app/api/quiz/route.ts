import { NextRequest, NextResponse } from "next/server";
import { getVocab, getKanji, getGrammar, JLPT_LEVELS, type JlptLevel } from "@/lib/datasets";

export const dynamic = "force-dynamic";

function parseN(raw: string | null): number | null {
  if (raw === null) return 10;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(Math.floor(n), 30);
}

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "vocab";
  const level = (req.nextUrl.searchParams.get("level") ?? "N5").toUpperCase();
  const n = parseN(req.nextUrl.searchParams.get("n"));

  if (!["vocab", "kanji", "grammar"].includes(type) || !JLPT_LEVELS.includes(level as JlptLevel)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }
  if (n === null) {
    return NextResponse.json({ error: "Invalid n" }, { status: 400 });
  }

  let prompts: { prompt: string; answer: string; alt: string | null }[] = [];

  if (type === "vocab") {
    const items = getVocab(level as JlptLevel);
    const answers = items.map((i) => i.meanings[0]).filter(Boolean);
    const picked = shuffle(items).slice(0, n);
    prompts = picked.map((i) => {
      const answer = i.meanings[0] ?? i.word;
      return { prompt: i.word, answer, alt: i.reading || null };
    });
    const withDistractors = addDistractors(prompts, answers);
    return NextResponse.json({ questions: withDistractors });
  }

  if (type === "kanji") {
    const items = getKanji(level as JlptLevel);
    const answers = items.map((i) => i.meanings[0]).filter(Boolean);
    const picked = shuffle(items).slice(0, n);
    prompts = picked.map((i) => ({ prompt: i.character, answer: i.meanings[0] ?? i.character, alt: i.onyomi[0] ?? null }));
    return NextResponse.json({ questions: addDistractors(prompts, answers) });
  }

  const items = getGrammar(level as JlptLevel);
  const answers = items.map((i) => i.meaning).filter(Boolean);
  const picked = shuffle(items).slice(0, n);
  prompts = picked.map((i) => ({ prompt: i.pattern, answer: i.meaning ?? i.pattern, alt: null }));
  return NextResponse.json({ questions: addDistractors(prompts, answers) });
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function addDistractors(
  prompts: { prompt: string; answer: string; alt: string | null }[],
  pool: string[],
) {
  return prompts.map((p) => {
    const options = shuffle(pool.filter((a) => a !== p.answer && a !== p.alt))
      .slice(0, 3)
      .concat(p.answer);
    return { ...p, options: shuffle(options) };
  });
}
