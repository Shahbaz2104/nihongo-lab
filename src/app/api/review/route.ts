import { NextRequest, NextResponse } from "next/server";
import { submitReview } from "@/lib/review-service";
import { gradeToQ } from "@/lib/srs";

const GRADES = ["again", "hard", "good", "easy"] as const;

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { cardId, grade } = body;

  if (typeof cardId !== "string" || !GRADES.includes(grade)) {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const result = await submitReview(cardId, grade);
  return NextResponse.json({ ok: true, grade: gradeToQ(grade), ...result });
}
