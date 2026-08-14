import { NextRequest, NextResponse } from "next/server";
import { ensureCard, type CardType } from "@/lib/review-service";
import { JLPT_LEVELS, type JlptLevel } from "@/lib/datasets";

const TYPES: CardType[] = ["vocab", "kanji", "kana", "grammar"];

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { type, sourceId, front, back, reading, level } = body as {
    type?: unknown;
    sourceId?: unknown;
    front?: unknown;
    back?: unknown;
    reading?: unknown;
    level?: unknown;
  };

  if (
    typeof type !== "string" ||
    !TYPES.includes(type as CardType) ||
    typeof sourceId !== "string" ||
    sourceId.length === 0 ||
    sourceId.length > 100 ||
    typeof front !== "string" ||
    front.length === 0 ||
    typeof back !== "string" ||
    back.length === 0 ||
    (reading !== null && typeof reading !== "string") ||
    (level !== undefined && level !== null && typeof level !== "string") ||
    (typeof level === "string" && !JLPT_LEVELS.includes(level as JlptLevel))
  ) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await ensureCard({
    type: type as CardType,
    sourceId,
    front,
    back,
    reading: (reading as string | null) ?? null,
    level: typeof level === "string" ? (level as JlptLevel) : null,
  });

  return NextResponse.json({ ok: true, ...result });
}
