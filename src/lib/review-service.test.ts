import { describe, expect, it } from "vitest";
import { db } from "./db";
import { getReviewQueue, submitReview } from "./review-service";
import { getKana } from "./datasets";
import { dayKey } from "./dates";

const KANA = getKana().length;

async function clearKanaCards() {
  const kanaCards = await db.card.findMany({ where: { type: "kana" }, select: { id: true } });
  for (const c of kanaCards) await db.card.delete({ where: { id: c.id } });
}

describe("review queue — kana", () => {
  it("does not duplicate kana cards when the requested level changes", async () => {
    await clearKanaCards();
    try {
      const first = await getReviewQueue("kana", "N5", 20);
      expect(first.length).toBe(20);

      const second = await getReviewQueue("kana", "N4", 20);
      expect(second.length).toBe(20);

      const total = await db.card.count({ where: { type: "kana" } });
      // Exactly 20 kana cards exist — none duplicated by the level switch.
      expect(total).toBe(20);
      expect(total).toBeLessThanOrEqual(KANA);

      const ids = new Set(second.map((c) => c.id));
      expect(ids.size).toBe(second.length);
    } finally {
      await clearKanaCards();
    }
  });

  it("submits a kana review without level filtering", async () => {
    await clearKanaCards();
    try {
      const [card] = await getReviewQueue("kana", "N5", 1);
      const res = await submitReview(card.id, "good");
      expect(res.nextInterval).toBe(1);
      const stored = await db.card.findUnique({ where: { id: card.id } });
      expect(stored?.status).toBe(2);
      expect(stored?.level).toBeNull();
    } finally {
      await clearKanaCards();
    }
  });

  it("keeps card, ReviewLog, and DayStat consistent after a review", async () => {
    await clearKanaCards();
    try {
      const beforeLogs = await db.reviewLog.count();
      const [card] = await getReviewQueue("kana", "N5", 1);
      const before = await db.dayStat.findUnique({ where: { date: dayKey(new Date()) } });

      await submitReview(card.id, "good");

      // Card SRS state is updated
      const stored = await db.card.findUnique({ where: { id: card.id } });
      expect(stored?.status).toBe(2);
      expect(stored?.reps).toBeGreaterThan(0);

      // A ReviewLog row was created
      const afterLogs = await db.reviewLog.count();
      expect(afterLogs).toBe(beforeLogs + 1);
      const log = await db.reviewLog.findFirst({ where: { cardId: card.id } });
      expect(log?.grade).toBe(4);

      // DayStat incremented
      const after = await db.dayStat.findFirst({ orderBy: { date: "desc" } });
      const reviewsDelta =
        (after?.reviews ?? 0) - (before?.reviews ?? 0);
      expect(reviewsDelta).toBe(1);
    } finally {
      await clearKanaCards();
    }
  });
});
