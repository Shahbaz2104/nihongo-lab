import { NextRequest, NextResponse } from "next/server";
import { submitReview } from "@/lib/review-service";
import { gradeToQ } from "@/lib/srs";

const GRADES = ["again", "hard", "good", "easy"] as const;

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { cardId, grade } = body as { cardId?: unknown; grade?: unknown };

  if (typeof cardId !== "string" || !GRADES.includes(grade as (typeof GRADES)[number])) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  try {
    const result = await submitReview(cardId, grade as (typeof GRADES)[number]);
    return NextResponse.json({ ok: true, grade: gradeToQ(grade as (typeof GRADES)[number]), ...result });
  } catch (err) {
    if (err instanceof Error && err.message === "Card not found") {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }
    throw err;
  }
}
