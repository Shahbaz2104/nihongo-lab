"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { Cards } from "@phosphor-icons/react";
import { api, type Grade, type ReviewCard } from "@/lib/api";
import { speakJapanese } from "@/lib/tts";
import { Furigana } from "@/components/Furigana";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { Skeleton } from "@/components/ui/Skeleton";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

interface Props {
  type: string;
  level: string;
  limit?: number;
  onRestart?: () => void;
  onComplete?: () => void;
}

const gradeOrder: Grade[] = ["again", "hard", "good", "easy"];

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

export function FlashcardReview({ type, level, limit = 20, onRestart, onComplete }: Props) {
  const [queue, setQueue] = useState<ReviewCard[]>([]);
  const [index, setIndex] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);
  const [session, setSession] = useState({ reviewed: 0, correct: 0 });
  const [submitting, setSubmitting] = useState(false);
  const reduce = useReducedMotion();

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
        if (alive) {
          setFailed(true);
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [type, level, limit]);

  const card = queue[index];

  const speak = useCallback(() => {
    if (!card) return;
    const target =
      card.reading && !card.reading.includes(",") ? card.reading : card.front;
    if (target) speakJapanese(target);
  }, [card]);

  const grade = useCallback(
    async (g: Grade) => {
      if (!card || submitting) return;
      setSubmitting(true);
      try {
        await api.review(card.id, g);
        setSession((s) => ({ reviewed: s.reviewed + 1, correct: s.correct + (g !== "again" ? 1 : 0) }));
        if (index + 1 >= queue.length) {
          setDone(true);
        } else {
          setRevealed(false);
          setIndex((i) => i + 1);
        }
      } finally {
        setSubmitting(false);
      }
    },
    [card, index, queue.length, submitting],
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;

      if (e.key === " ") {
        e.preventDefault();
        if (!revealed && card) setRevealed(true);
        return;
      }
      if (e.key === "s" || e.key === "S") {
        e.preventDefault();
        speak();
        return;
      }
      if (revealed && ["1", "2", "3", "4"].includes(e.key)) {
        e.preventDefault();
        grade(gradeOrder[Number(e.key) - 1]);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [revealed, card, speak, grade]);

  const isKanjiType = type === "kanji";

  if (loading) {
    return (
      <div className="mx-auto max-w-xl space-y-4">
        <div className="flex items-center justify-between text-xs text-muted">
          <span className="uppercase tracking-widest">
            {type} · {level}
          </span>
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-72 w-full" />
        <div className="grid grid-cols-4 gap-2">
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
          <Skeleton className="h-14" />
        </div>
      </div>
    );
  }

  if (failed) {
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-panel p-10 text-center">
        <div className="font-jp text-4xl">エラー</div>
        <p className="mt-3 text-sm text-muted">
          Couldn&apos;t load the review queue. Check that the database is available and try again.
        </p>
        <Button className="mt-6" onClick={onRestart}>
          Try again
        </Button>
      </div>
    );
  }

  if (done || queue.length === 0) {
    const pct = queue.length === 0 ? null : Math.round((session.correct / Math.max(1, session.reviewed)) * 100);
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-panel px-6 py-14 text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft">
          <Cards size={32} weight="duotone" className="text-accent" />
        </div>
        <div className="font-jp text-4xl font-bold">
          {queue.length === 0 ? "終了" : "おつかれさま"}
        </div>
        {pct !== null ? (
          <>
            <div className="mt-4 text-3xl font-bold tabular-nums">{pct}%</div>
            <div className="mt-1 text-xs text-muted">
              {session.correct} / {session.reviewed} correct this session
            </div>
            {pct === 100 && (
              <div className="mt-2 text-sm text-good">Perfect — 完璧！</div>
            )}
          </>
        ) : (
          <p className="mt-3 text-muted">No cards available for this level yet.</p>
        )}
        <div className="mt-8 flex items-center justify-center gap-3">
          {onComplete && (
            <Button onClick={onComplete}>
              {queue.length === 0 ? "Continue" : "Continue session"}
            </Button>
          )}
          <Button variant={onComplete ? "secondary" : "primary"} onClick={onRestart}>
            Review again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl">
      <div className="mb-4 flex items-center justify-between text-xs text-muted">
        <span className="uppercase tracking-widest">
          {type} · {level}
        </span>
        <span className="tabular-nums">
          {index + 1} / {queue.length}
        </span>
      </div>
      <ProgressBar value={(index + (revealed ? 0.5 : 0)) / queue.length} className="mb-5" />

      <div aria-live="polite">
        <AnimatePresence mode="wait">
          <motion.div
            key={card.id}
            initial={reduce ? false : { opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? undefined : { opacity: 0, x: -40 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="overflow-hidden rounded-2xl border border-line bg-panel"
          >
            <button
              onClick={() => setRevealed((r) => !r)}
              className="flex min-h-64 w-full cursor-pointer flex-col items-center justify-center gap-4 px-8 py-10"
            >
              <div className={`font-jp text-6xl font-bold tracking-wide ${isKanjiType ? "text-accent" : ""}`}>
                {card.type === "vocab" ? (
                  <Furigana word={card.front} reading={card.reading} />
                ) : (
                  card.front
                )}
              </div>
              {!revealed && (
                <div className="flex items-center gap-1.5 text-xs uppercase tracking-widest text-muted">
                  tap to reveal
                  <kbd className="kbd">space</kbd>
                </div>
              )}

              {revealed && (
                <motion.div
                  initial={reduce ? false : { opacity: 0, y: 8 }}
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
              <SpeakButton text={card.reading && !card.reading.includes(",") ? card.reading : card.front} />
              <div className="text-xs text-muted">
                {card.isNew ? "new" : `due in ${card.interval}d`}
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={reduce ? undefined : { opacity: 0 }}
            className="mt-4 grid grid-cols-4 gap-2"
          >
            {gradeOrder.map((g, i) => (
              <button
                key={g}
                onClick={() => grade(g)}
                disabled={submitting}
                className={`press rounded-xl px-3 py-4 text-sm font-semibold transition-colors disabled:cursor-wait disabled:opacity-60 ${gradeStyles[g]}`}
              >
                <span>{gradeHints[g]}</span>
                <kbd className="kbd ml-1.5">{i + 1}</kbd>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-4 text-center text-xs tabular-nums text-muted">
        session: {session.reviewed} reviewed · {session.correct} correct
      </div>
    </div>
  );
}
