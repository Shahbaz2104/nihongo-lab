import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const last30 = new Date(startOfDay.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalCards, dueCards, dayStats, recentLogs] = await Promise.all([
    db.card.count(),
    db.card.count({ where: { due: { lte: now } } }),
    db.dayStat.findMany({
      where: { date: { gte: last30.toISOString().slice(0, 10) } },
      orderBy: { date: "asc" },
    }),
    db.reviewLog.findMany({
      where: { reviewedAt: { gte: startOfDay } },
      select: { grade: true },
    }),
  ]);

  const byLevel = await db.card.groupBy({
    by: ["level"],
    _count: { _all: true },
    where: { level: { not: null } },
  });

  const todayReviews = recentLogs.length;
  const todayCorrect = recentLogs.filter((l) => l.grade >= 3).length;

  return NextResponse.json({
    totalCards,
    dueCards,
    todayReviews,
    todayAccuracy: todayReviews === 0 ? null : Math.round((todayCorrect / todayReviews) * 100),
    byLevel,
    history: dayStats.map((d) => ({ date: d.date, reviews: d.reviews, learned: d.learned })),
  });
}
