import { describe, expect, it } from "vitest";
import { db } from "./db";
import { getReviewQueue, submitReview } from "./review-service";
import { getKana } from "./datasets";

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
});
