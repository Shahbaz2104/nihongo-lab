"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { api, type Grade, type ReviewCard } from "@/lib/api";
import { speakJapanese } from "@/lib/tts";

interface Props {
  type: string;
  level: string;
  limit?: number;
  onRestart?: () => void;
}

const gradeStyles: Record<Grade, string> = {
  again: "bg-red-500/15 text-red-400 hover:bg-red-500/25",
  hard: "bg-gold/15 text-gold hover:bg-gold/25",
  good: "bg-green-500/15 text-green-400 hover:bg-green-500/25",
  easy: "bg-indigo/15 text-indigo hover:bg-indigo/25",
};

const gradeHints: Record<Grade, string> = {
  again: "Again",
  hard: "Hard",
  good: "Good",
  easy: "Easy",
};

export function FlashcardReview({ type, level, limit = 20, onRestart }: Props) {
  const [queue, setQueue] = useState<ReviewCard[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [session, setSession] = useState({ reviewed: 0, correct: 0 });

  useEffect(() => {
    let alive = true;
    api
      .queue(type, level, limit)
      .then(({ queue }) => {
        if (alive) {
          setQueue(queue);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [type, level, limit]);

  const card = queue[index];

  const speak = useCallback(
    (text?: string) => {
      const target = text ?? (card ? (card.reading && !card.reading.includes(",") ? card.reading : card.front) : "");
      if (target) speakJapanese(target);
    },
    [card],
  );

  const grade = useCallback(
    async (g: Grade) => {
      if (!card) return;
      await api.review(card.id, g);
      setSession((s) => ({ reviewed: s.reviewed + 1, correct: s.correct + (g !== "again" ? 1 : 0) }));
      if (index + 1 >= queue.length) {
        setDone(true);
      } else {
        setRevealed(false);
        setIndex((i) => i + 1);
      }
    },
    [card, index, queue.length],
  );

  const isKanjiType = type === "kanji";

  if (loading) {
    return <div className="py-20 text-center text-muted">Loading review queue…</div>;
  }

  if (done || queue.length === 0) {
    return (
      <div className="mx-auto max-w-lg py-16 text-center">
        <div className="mb-4 font-jp text-5xl">終了 🎉</div>
        <p className="text-muted">
          {queue.length === 0
            ? "No cards available for this level yet."
            : `Session complete — ${session.reviewed} reviewed, ${session.correct} correct.`}
        </p>
        <button
          onClick={onRestart}
          className="mt-8 rounded-xl bg-accent px-6 py-3 font-medium text-black transition-opacity hover:opacity-90"
        >
          Review again
        </button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between text-xs text-muted">
        <span className="uppercase tracking-widest">
          {type} · {level}
        </span>
        <span>
          {index + 1} / {queue.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={card.id}
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -40 }}
          transition={{ duration: 0.2 }}
          className="overflow-hidden rounded-2xl border border-line bg-panel"
        >
          <button
            onClick={() => setRevealed((r) => !r)}
            className="flex min-h-64 w-full cursor-pointer flex-col items-center justify-center gap-4 px-8 py-10"
          >
            <div className={`font-jp text-6xl font-bold tracking-wide ${isKanjiType ? "text-accent" : ""}`}>
              {card.front}
            </div>
            {!revealed && (
              <div className="text-xs uppercase tracking-widest text-muted">tap to reveal</div>
            )}

            {revealed && (
              <motion.div
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-2 text-center"
              >
                {card.reading && (
                  <div className="font-jp text-2xl text-indigo">{card.reading}</div>
                )}
                <div className="text-lg">{card.back}</div>
                {card.example && (
                  <div className="mt-3 rounded-xl bg-panel-2 px-4 py-3 text-sm">
                    <div className="font-jp text-base text-foreground/90">{card.example}</div>
                    {card.exampleFuri && <div className="mt-1 text-xs text-muted">{card.exampleFuri}</div>}
                  </div>
                )}
              </motion.div>
            )}
          </button>

          <div className="flex items-center justify-between border-t border-line px-4 py-3">
            <button
              onClick={() => speak()}
              className="grid h-9 w-9 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent hover:text-accent"
              aria-label="Speak"
            >
              🔊
            </button>
            <div className="text-xs text-muted">
              {card.isNew ? "new" : `due in ${card.interval}d`}
            </div>
          </div>
        </motion.div>
      </AnimatePresence>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 grid grid-cols-4 gap-2"
          >
            {(Object.keys(gradeStyles) as Grade[]).map((g) => (
              <button
                key={g}
                onClick={() => grade(g)}
                className={`rounded-xl px-3 py-4 text-sm font-semibold transition-all hover:scale-[1.02] ${gradeStyles[g]}`}
              >
                {gradeHints[g]}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 text-center text-xs text-muted">
        session: {session.reviewed} reviewed · {session.correct} correct
      </div>
    </div>
  );
}
