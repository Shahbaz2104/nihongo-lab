import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dayKey, startOfDay } from "@/lib/dates";
import { getVocab, JLPT_LEVELS, type JlptLevel } from "@/lib/datasets";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const dayStart = startOfDay(now);
  const last30 = new Date(dayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalCards, dueCards, dayStats, recentLogs, existingVocab] = await Promise.all([
    db.card.count(),
    db.card.count({ where: { due: { lte: now } } }),
    db.dayStat.findMany({
      where: { date: { gte: dayKey(last30) } },
      orderBy: { date: "asc" },
    }),
    db.reviewLog.findMany({
      where: { reviewedAt: { gte: dayStart } },
      select: { grade: true },
    }),
    db.card.findMany({
      where: { type: "vocab" },
      select: { sourceId: true },
    }),
  ]);

  const byLevel = await db.card.groupBy({
    by: ["level"],
    _count: { _all: true },
    where: { level: { not: null } },
  });

  const todayReviews = recentLogs.length;
  const todayCorrect = recentLogs.filter((l) => l.grade >= 3).length;

  const seenVocab = new Set(existingVocab.map((c) => c.sourceId));
  let newWords = 0;
  for (const lvl of JLPT_LEVELS) {
    const items = getVocab(lvl as JlptLevel);
    newWords += items.filter((i) => !seenVocab.has(i.word)).length;
  }

  return NextResponse.json({
    totalCards,
    dueCards,
    todayReviews,
    todayAccuracy: todayReviews === 0 ? null : Math.round((todayCorrect / todayReviews) * 100),
    byLevel,
    history: dayStats.map((d) => ({ date: d.date, reviews: d.reviews, learned: d.learned })),
    newWords,
  });
}
