import { NextRequest, NextResponse } from "next/server";
import { getVocab, JLPT_LEVELS, type JlptLevel } from "@/lib/datasets";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const level = (req.nextUrl.searchParams.get("level") ?? "N5").toUpperCase();
  const nRaw = req.nextUrl.searchParams.get("n");
  const n = nRaw === null ? 5 : Number(nRaw);

  if (!JLPT_LEVELS.includes(level as JlptLevel)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }
  if (!Number.isFinite(n) || n < 1) {
    return NextResponse.json({ error: "Invalid n" }, { status: 400 });
  }

  const [items, existing] = await Promise.all([
    Promise.resolve(getVocab(level as JlptLevel)),
    db.card.findMany({
      where: { type: "vocab", level },
      select: { sourceId: true },
    }),
  ]);
  const seen = new Set(existing.map((c) => c.sourceId));
  const unseen = items
    .filter((i) => !seen.has(i.word))
    .sort(() => Math.random() - 0.5)
    .slice(0, Math.min(Math.floor(n), 10));

  return NextResponse.json({
    words: unseen.map((i) => ({
      word: i.word,
      kanji: i.kanji ?? null,
      reading: i.reading || i.word,
      meanings: i.meanings,
      example: i.examples[0]?.ja ?? null,
      exampleEn: i.examples[0]?.en ?? null,
    })),
  });
}