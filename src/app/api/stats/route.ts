import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { dayKey, startOfDay } from "@/lib/dates";
import { getVocab, getKanji, getGrammar, JLPT_LEVELS, type JlptLevel } from "@/lib/datasets";

export const dynamic = "force-dynamic";

export async function GET() {
  const now = new Date();
  const dayStart = startOfDay(now);
  const last30 = new Date(dayStart.getTime() - 30 * 24 * 60 * 60 * 1000);

  const [totalCards, dueCards, dayStats, recentLogs, existingVocab, totalReviews, learnedByType] =
    await Promise.all([
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
      db.reviewLog.count(),
      db.card.groupBy({
        by: ["type"],
        where: { reps: { gte: 1 } },
        _count: { _all: true },
      }),
    ]);

  const byLevel = await db.card.groupBy({
    by: ["level"],
    _count: { _all: true },
    where: { level: { not: null } },
  });

  const learnedByLevel = await db.card.groupBy({
    by: ["level"],
    _count: { _all: true },
    where: { level: { not: null }, reps: { gte: 1 } },
  });

  const todayReviews = recentLogs.length;
  const todayCorrect = recentLogs.filter((l) => l.grade >= 3).length;

  const seenVocab = new Set(existingVocab.map((c) => c.sourceId));
  let newWords = 0;
  for (const lvl of JLPT_LEVELS) {
    const items = getVocab(lvl as JlptLevel);
    newWords += items.filter((i) => !seenVocab.has(i.word)).length;
  }

  const learnedMap = new Map(learnedByLevel.map((b) => [b.level, b._count._all]));
  const levelProgress = JLPT_LEVELS.map((lvl) => {
    const total =
      getVocab(lvl as JlptLevel).length +
      getKanji(lvl as JlptLevel).length +
      getGrammar(lvl as JlptLevel).length;
    const learned = learnedMap.get(lvl) ?? 0;
    return {
      level: lvl,
      learned,
      total,
      pct: total === 0 ? 0 : Math.round((learned / total) * 100),
    };
  });

  const byTypeMap = new Map(learnedByType.map((b) => [b.type, b._count._all]));

  return NextResponse.json({
    totalCards,
    dueCards,
    todayReviews,
    todayAccuracy: todayReviews === 0 ? null : Math.round((todayCorrect / todayReviews) * 100),
    byLevel,
    history: dayStats.map((d) => ({ date: d.date, reviews: d.reviews, learned: d.learned })),
    newWords,
    totalReviews,
    cardsLearned: [...byTypeMap.values()].reduce((a, b) => a + b, 0),
    learnedByType: {
      vocab: byTypeMap.get("vocab") ?? 0,
      kanji: byTypeMap.get("kanji") ?? 0,
      kana: byTypeMap.get("kana") ?? 0,
      grammar: byTypeMap.get("grammar") ?? 0,
    },
    levelProgress,
  });
}