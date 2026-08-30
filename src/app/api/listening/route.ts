import { NextRequest, NextResponse } from "next/server";
import { getVocab, JLPT_LEVELS, type JlptLevel } from "@/lib/datasets";
import { tokenize } from "@/lib/tokenizer";
import { mulberry32, seededShuffle } from "@/lib/random";

export const dynamic = "force-dynamic";

function parseN(raw: string | null): number | null {
  if (raw === null) return 10;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(Math.floor(n), 10);
}

function contentTokens(jp: string): Set<string> {
  const out = new Set<string>();
  for (const t of tokenize(jp)) {
    if (t.type !== "char") out.add(t.text);
  }
  return out;
}

export async function GET(req: NextRequest) {
  const level = (req.nextUrl.searchParams.get("level") ?? "N5").toUpperCase();
  const n = parseN(req.nextUrl.searchParams.get("n"));

  if (!JLPT_LEVELS.includes(level as JlptLevel)) {
    return NextResponse.json({ error: "Invalid params" }, { status: 400 });
  }
  if (n === null) {
    return NextResponse.json({ error: "Invalid n" }, { status: 400 });
  }

  const seedRaw = req.nextUrl.searchParams.get("seed");
  const seed = seedRaw !== null ? Number(seedRaw) : Math.floor(Math.random() * 2 ** 32);
  const rng = Number.isFinite(seed) ? mulberry32(seed) : mulberry32(0);

  const items = getVocab(level as JlptLevel).filter(
    (i) => (i.examples ?? []).length > 0 && (i.examples[0]?.ja ?? "").trim().length > 0,
  );
  if (items.length < 4) {
    return NextResponse.json({ error: "Not enough sentences" }, { status: 422 });
  }

  // Tokenize each sentence once, then reuse across all targets instead of
  // re-tokenizing the whole pool for every target (avoids O(n²) work).
  const sentenceTokens = new Map<string, Set<string>>();
  for (const o of items) {
    const s = o.examples[0].ja;
    if (!sentenceTokens.has(s)) sentenceTokens.set(s, contentTokens(s));
  }

  const targets = seededShuffle(items, rng).slice(0, n);

  const questions = targets.map((item) => {
    const jp = item.examples[0].ja;
    const en = item.examples[0].en ?? "";
    const targetTokens = sentenceTokens.get(jp)!;

    const scored: { sentence: string; overlap: number }[] = [];
    for (const [s, tokens] of sentenceTokens) {
      if (s === jp) continue;
      scored.push({ sentence: s, overlap: countOverlap(targetTokens, tokens) });
    }
    const pool = scored.sort((a, b) => b.overlap - a.overlap).slice(0, 3);
    const distractors = seededShuffle(pool, rng).map((c) => c.sentence);

    const options = seededShuffle([...distractors, jp], rng);
    return { jp, en, options, answer: jp, tokens: tokenize(jp) };
  });

  return NextResponse.json({ questions });
}

function countOverlap(a: Set<string>, b: Set<string>): number {
  let n = 0;
  for (const t of a) if (b.has(t)) n++;
  return n;
}