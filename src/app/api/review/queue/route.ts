import { NextRequest, NextResponse } from "next/server";
import { getReviewQueue, type CardType } from "@/lib/review-service";
import { JLPT_LEVELS, type JlptLevel } from "@/lib/datasets";

function parseLimit(raw: string | null, fallback: number, max: number): number | null {
  if (raw === null) return fallback;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 1) return null;
  return Math.min(Math.floor(n), max);
}

export async function GET(req: NextRequest) {
  const type = (req.nextUrl.searchParams.get("type") ?? "vocab") as CardType;
  const level = (req.nextUrl.searchParams.get("level") ?? "N5").toUpperCase() as JlptLevel;
  const limit = parseLimit(req.nextUrl.searchParams.get("limit"), 20, 50);

  if (!["vocab", "kanji", "kana", "grammar"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!JLPT_LEVELS.includes(level)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }
  if (limit === null) {
    return NextResponse.json({ error: "Invalid limit" }, { status: 400 });
  }

  const queue = await getReviewQueue(type, level, limit);
  return NextResponse.json({ queue });
}
