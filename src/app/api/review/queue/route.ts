import { NextRequest, NextResponse } from "next/server";
import { getReviewQueue } from "@/lib/review-service";
import { JLPT_LEVELS, type JlptLevel } from "@/lib/datasets";

export async function GET(req: NextRequest) {
  const type = req.nextUrl.searchParams.get("type") ?? "vocab";
  const level = (req.nextUrl.searchParams.get("level") ?? "N5").toUpperCase();
  const limit = Math.min(50, Number(req.nextUrl.searchParams.get("limit") ?? 20));

  if (!["vocab", "kanji", "kana", "grammar"].includes(type)) {
    return NextResponse.json({ error: "Invalid type" }, { status: 400 });
  }
  if (!JLPT_LEVELS.includes(level as JlptLevel)) {
    return NextResponse.json({ error: "Invalid level" }, { status: 400 });
  }

  const queue = await getReviewQueue(type as "vocab", level as JlptLevel, limit);
  return NextResponse.json({ queue });
}
