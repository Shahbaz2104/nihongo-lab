"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle, Ear, Gauge, Headphones, Play, XCircle } from "@phosphor-icons/react";
import { api, type ListeningQuestion } from "@/lib/api";
import { speakJapanese } from "@/lib/tts";
import { LevelSelector } from "@/components/LevelSelector";
import { HoverText } from "@/components/HoverText";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Skeleton } from "@/components/ui/Skeleton";

export function Listening() {
  const [level, setLevel] = useState("N5");
  const [questions, setQuestions] = useState<ListeningQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0);
  const [slow, setSlow] = useState(false);
  const [speaking, setSpeaking] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    let alive = true;
    setFailed(false);
    api
      .listening(level, 5)
      .then(({ questions }) => {
        if (alive) {
          setQuestions(questions);
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
  }, [level, round]);

  const q = questions[index];

  const play = async () => {
    if (!q || speaking) return;
    setSpeaking(true);
    await speakJapanese(q.jp, slow ? 0.6 : 0.85);
    setSpeaking(false);
  };

  useEffect(() => {
    if (loading || done || picked || !q) return;
    const onKey = (e: KeyboardEvent) => {
      if (["1", "2", "3", "4"].includes(e.key)) {
        const opt = q.options[Number(e.key) - 1];
        if (opt) {
          e.preventDefault();
          setPicked(opt);
          if (opt === q.answer) setScore((s) => s + 1);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, done, picked, q]);

  const startNew = () => {
    setRound((r) => r + 1);
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    setLoading(true);
  };

  const next = () => {
    if (index + 1 >= questions.length) setDone(true);
    else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Listening practice</h1>
          <p className="mt-1 text-sm text-muted">Hear a sentence and pick the one you heard.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <LevelSelector value={level} onChange={setLevel} />
          <Button variant="secondary" size="sm" onClick={startNew}>
            New round
          </Button>
        </div>
      </header>

      {loading && (
        <div className="mx-auto max-w-lg space-y-4">
          <Skeleton className="h-72 w-full" />
        </div>
      )}

      {!loading && failed && (
        <div className="mx-auto max-w-md rounded-2xl border border-line bg-panel px-6 py-14 text-center">
          <div className="font-jp text-3xl font-bold">エラー</div>
          <p className="mt-3 text-muted">Unable to load listening practice. Please try again.</p>
          <Button className="mt-8" onClick={startNew}>
            Try again
          </Button>
        </div>
      )}

      {!loading && done && (
        <div className="mx-auto max-w-md rounded-2xl border border-line bg-panel px-6 py-14 text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft">
            <Ear size={30} weight="duotone" className="text-accent" />
          </div>
          <div className="font-jp text-4xl font-bold">結果</div>
          <div className="mt-4 text-3xl font-bold tabular-nums">
            {score} / {questions.length}
          </div>
          <p className="mt-2 text-muted">
            {score === questions.length ? "Perfect ears — 完璧！" : "Keep listening — 頑張って！"}
          </p>
          <Button className="mt-8" onClick={startNew}>
            Practice again
          </Button>
        </div>
      )}

      {!loading && !done && q && (
        <div className="mx-auto max-w-lg">
          <div className="mb-4 flex items-center justify-between text-xs text-muted">
            <span className="uppercase tracking-widest">Listening · {level}</span>
            <span className="tabular-nums">
              {index + 1} / {questions.length}
            </span>
          </div>
          <ProgressBar value={index / questions.length} className="mb-5" />

          <motion.div
            key={index}
            initial={reduce ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-line bg-panel p-6"
          >
            <div className="flex flex-col items-center py-6 text-center">
              <div className="mb-3 text-xs uppercase tracking-widest text-muted">What did you hear?</div>
              <div className="flex items-center gap-3">
                <button
                  onClick={play}
                  disabled={speaking}
                  aria-label="Play the sentence"
                  className="press grid h-16 w-16 place-items-center rounded-full bg-accent text-black transition-transform hover:scale-105 disabled:opacity-60"
                >
                  <Play size={26} weight="fill" />
                </button>
                <button
                  onClick={() => setSlow((s) => !s)}
                  aria-pressed={slow}
                  className={`press flex items-center gap-1.5 rounded-full border px-3 py-2 text-xs font-semibold transition-colors ${
                    slow ? "border-accent bg-accent-soft text-accent" : "border-line text-muted hover:border-accent"
                  }`}
                >
                  <Gauge size={14} weight="duotone" />
                  {slow ? "0.6× slow" : "Slow"}
                </button>
              </div>
              <p className="mt-3 text-xs text-muted">Tap the button to listen{slow ? " (slower)" : ""} — replay as often as you like.</p>
            </div>

            <div className="grid gap-2" role="group" aria-label="Answer options">
              {q.options.map((o, i) => {
                const isAnswer = o === q.answer;
                const isPicked = o === picked;
                let cls = "border-line bg-panel hover:border-accent";
                if (picked) {
                  if (isAnswer) cls = "border-good/50 bg-good/15 text-good";
                  else if (isPicked) cls = "border-red-500/50 bg-red-500/15 text-red-400";
                  else cls = "border-line bg-panel opacity-50";
                }
                return (
                  <button
                    key={o}
                    onClick={() => {
                      if (picked) return;
                      setPicked(o);
                      if (o === q.answer) setScore((s) => s + 1);
                    }}
                    disabled={!!picked}
                    className={`press rounded-xl border px-4 py-3 text-left font-jp text-sm transition-colors disabled:cursor-default ${cls}`}
                  >
                    <span className="mr-2 text-xs text-muted">{String.fromCharCode(65 + i)}.</span>
                    {o}
                  </button>
                );
              })}
            </div>

            <div aria-live="polite">
              <AnimatePresence>
                {picked && (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="mt-6"
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      {picked === q.answer ? (
                        <>
                          <CheckCircle size={16} weight="bold" className="shrink-0 text-good" />
                          <span className="text-good">Correct!</span>
                        </>
                      ) : (
                        <>
                          <XCircle size={16} weight="bold" className="shrink-0 text-red-400" />
                          <span className="text-red-400">You heard: “{q.answer}”</span>
                        </>
                      )}
                    </div>
                    <div className="mt-4 rounded-xl bg-panel-2 px-4 py-3">
                      <HoverText tokens={q.tokens} className="font-jp text-lg leading-relaxed" />
                      {q.en && <div className="mt-1 text-sm text-muted">{q.en}</div>}
                      <p className="mt-2 text-xs text-muted">Hover any word for its meaning — add it to your reviews.</p>
                    </div>
                    <Button className="mt-4" onClick={next}>
                      {index + 1 >= questions.length ? "See results" : "Next"}
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>
      )}

      <div className="mx-auto max-w-lg text-center text-xs text-muted">
        <Headphones size={14} className="mr-1 inline" weight="duotone" />
        Uses your browser&rsquo;s speech synthesis — works offline, no external API.
      </div>
    </div>
  );
}