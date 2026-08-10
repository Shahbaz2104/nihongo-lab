import { db } from "@/lib/db";
import { getVocab, getKanji, getGrammar, getKana, type JlptLevel } from "@/lib/datasets";
import { newCardState, reviewCard, type Grade } from "@/lib/srs";
import { readingLine } from "@/lib/annotate";

export type CardType = "vocab" | "kanji" | "kana" | "grammar";

interface DatasetEntry {
  sourceId: string;
  front: string;
  back: string;
  reading: string | null;
  example: string | null;
  exampleFuri: string | null;
}

const dayStart = (d: Date) => {
  const dt = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  return dt.toISOString().slice(0, 10);
};

function datasetEntries(type: CardType, level?: JlptLevel): DatasetEntry[] {
  switch (type) {
    case "vocab": {
      const items = level ? getVocab(level) : [];
      return items.map((v) => ({
        sourceId: v.word,
        front: v.kanji ?? v.word,
        back: (v.meanings ?? []).join("; ") || v.word,
        reading: v.reading || v.word,
        example: v.examples?.[0]?.ja ?? null,
        exampleFuri: v.examples?.[0]?.ja ? readingLine(v.examples[0].ja) : null,
      }));
    }
    case "kanji": {
      const items = level ? getKanji(level) : [];
      return items.map((k) => ({
        sourceId: k.character,
        front: k.character,
        back: (k.meanings ?? []).join("; ") || k.character,
        reading: (k.onyomi ?? []).concat(k.kunyomi ?? []).join(", ") || null,
        example: null,
        exampleFuri: null,
      }));
    }
    case "grammar": {
      const items = level ? getGrammar(level) : [];
      return items.map((g) => ({
        sourceId: g.pattern,
        front: g.pattern,
        back: `${g.meaning ?? g.pattern}${g.formation ? ` — ${g.formation}` : ""}`,
        reading: null,
        example: g.examples?.[0]?.ja ?? null,
        exampleFuri: g.examples?.[0]?.ja ? readingLine(g.examples[0].ja) : null,
      }));
    }
    case "kana": {
      return getKana().map((k) => ({
        sourceId: k.char,
        front: k.char,
        back: k.romaji,
        reading: null,
        example: null,
        exampleFuri: null,
      }));
    }
  }
}

export async function getReviewQueue(type: CardType, level: JlptLevel, limit = 20) {
  const entries = datasetEntries(type, level);
  const existing = await db.card.findMany({
    where: { type, level },
    orderBy: { due: "asc" },
  });

  const existingBySource = new Map(existing.map((c) => [c.sourceId, c]));
  const now = new Date();

  const due = existing
    .filter((c) => c.due.getTime() <= now.getTime())
    .sort((a, b) => a.due.getTime() - b.due.getTime());

  const newNeeded = Math.max(0, limit - due.length);
  const missing = entries.filter((e) => !existingBySource.has(e.sourceId)).slice(0, newNeeded);

  const created: typeof existing = [];
  if (missing.length > 0) {
    const rows = missing.map((e) => {
      const state = newCardState(now);
      return {
        sourceId: e.sourceId,
        type,
        front: e.front,
        back: e.back,
        reading: e.reading,
        example: e.example,
        exampleFuri: e.exampleFuri,
        level,
        status: state.status,
        ease: state.ease,
        interval: state.interval,
        reps: state.reps,
        lapses: state.lapses,
        due: state.due,
      };
    });
    await db.card.createMany({ data: rows });
    const ids = rows.map((r) => r.sourceId);
    const inserted = await db.card.findMany({
      where: { type, level, sourceId: { in: ids } },
    });
    created.push(...inserted);
  }

  return [...due, ...created].slice(0, limit).map((c) => ({
    id: c.id,
    front: c.front,
    back: c.back,
    reading: c.reading,
    example: c.example,
    exampleFuri: c.exampleFuri,
    type: c.type,
    level: c.level,
    status: c.status,
    interval: c.interval,
    reps: c.reps,
    isNew: c.status === 0,
  }));
}

export async function submitReview(cardId: string, grade: Grade) {
  const card = await db.card.findUnique({ where: { id: cardId } });
  if (!card) throw new Error("Card not found");

  const result = reviewCard(
    { ...card, due: card.due },
    grade,
  );

  const now = new Date();
  await db.card.update({
    where: { id: cardId },
    data: {
      status: result.state.status,
      ease: result.state.ease,
      interval: result.state.interval,
      reps: result.state.reps,
      lapses: result.state.lapses,
      due: result.state.due,
      lastReviewAt: now,
    },
  });

  await db.reviewLog.create({
    data: {
      cardId,
      grade: result.q,
      interval: result.state.interval,
      ease: result.state.ease,
      reviewedAt: now,
    },
  });

  const date = dayStart(now);
  await db.dayStat.upsert({
    where: { date },
    create: { date, reviews: 1, learned: result.correct && card.status === 0 ? 1 : 0 },
    update: {
      reviews: { increment: 1 },
      ...(result.correct && card.status === 0 ? { learned: { increment: 1 } } : {}),
    },
  });

  return { nextInterval: result.state.interval, nextDue: result.state.due };
}
