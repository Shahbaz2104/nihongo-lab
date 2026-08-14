"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle, Trophy, XCircle } from "@phosphor-icons/react";
import { api, type QuizQuestion } from "@/lib/api";
import { speakJapanese } from "@/lib/tts";
import { LevelSelector } from "@/components/LevelSelector";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

const types = [
  { id: "vocab", label: "Vocab", speak: true },
  { id: "kanji", label: "Kanji", speak: true },
  { id: "grammar", label: "Grammar", speak: false },
];

const directions: Record<string, { id: string; label: string }[]> = {
  vocab: [
    { id: "je", label: "→ English" },
    { id: "ej", label: "→ Japanese" },
  ],
  kanji: [
    { id: "km", label: "→ Meaning" },
    { id: "kr", label: "→ Reading" },
  ],
  grammar: [{ id: "m", label: "→ Meaning" }],
};

const subtitles: Record<string, string> = {
  je: "What does it mean?",
  ej: "Which word means this?",
  km: "What does it mean?",
  kr: "What's the reading?",
  m: "What does it mean?",
};

export function Quiz() {
  const [type, setType] = useState("vocab");
  const [level, setLevel] = useState("N5");
  const [direction, setDirection] = useState("je");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    let alive = true;
    api
      .quiz(type, level, 10, direction)
      .then(({ questions }) => {
        if (alive) {
          setQuestions(questions);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) setLoading(false);
      });
    return () => {
      alive = false;
    };
  }, [type, level, direction, round]);

  const startNew = () => {
    setRound((r) => r + 1);
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    setLoading(true);
  };

  const q = questions[index];
  const baseSpeak = types.find((t) => t.id === type)?.speak;
  const speakEnabled = baseSpeak && !(type === "vocab" && direction === "ej");

  const pick = (option: string) => {
    if (picked) return;
    setPicked(option);
    if (option === q.answer) {
      setScore((s) => s + 1);
      if (speakEnabled) speakJapanese(q.prompt);
    }
  };

  const next = () => {
    if (index + 1 >= questions.length) setDone(true);
    else {
      setIndex((i) => i + 1);
      setPicked(null);
    }
  };

  const changeType = (id: string) => {
    setType(id);
    setDirection(directions[id][0].id);
    startNew();
  };

  const changeDirection = (id: string) => {
    setDirection(id);
    startNew();
  };

  const changeLevel = (l: string) => {
    setLevel(l);
    startNew();
  };

  useEffect(() => {
    if (loading || done || picked || !q) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (["1", "2", "3", "4"].includes(e.key)) {
        const opt = q.options[Number(e.key) - 1];
        if (opt) {
          e.preventDefault();
          setPicked(opt);
          if (opt === q.answer) {
            setScore((s) => s + 1);
            if (speakEnabled) speakJapanese(q.prompt);
          }
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [loading, done, picked, q, speakEnabled]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Quiz</h1>
          <p className="mt-1 text-sm text-muted">Multiple-choice on your current level.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            options={types}
            value={type}
            onChange={changeType}
          />
          {directions[type].length > 1 && (
            <SegmentedControl
              options={directions[type]}
              value={direction}
              onChange={changeDirection}
            />
          )}
          <LevelSelector value={level} onChange={changeLevel} />
          <Button variant="secondary" size="sm" onClick={startNew}>
            New quiz
          </Button>
        </div>
      </header>

      {loading && (
        <div className="mx-auto max-w-lg space-y-4">
          <div className="flex items-center justify-between text-xs text-muted">
            <span className="uppercase tracking-widest">
              {type} · {level}
            </span>
            <Skeleton className="h-3 w-12" />
          </div>
          <Skeleton className="h-72 w-full" />
        </div>
      )}

      {!loading && done && (
        <div className="mx-auto max-w-md rounded-2xl border border-line bg-panel px-6 py-14 text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft">
            <Trophy size={30} weight="duotone" className="text-accent" />
          </div>
          <div className="font-jp text-4xl font-bold">結果</div>
          <div className="mt-4 text-3xl font-bold tabular-nums">
            {score} / {questions.length}
          </div>
          <p className="mt-2 text-muted">
            {score === questions.length
              ? "Perfect — 完璧！"
              : "Keep practicing — 頑張って！"}
          </p>
          <Button className="mt-8" onClick={startNew}>
            Quiz again
          </Button>
        </div>
      )}

      {!loading && !done && q && (
        <div className="mx-auto max-w-lg">
          <div className="mb-4 flex items-center justify-between text-xs text-muted">
            <span className="uppercase tracking-widest">
              {type} · {level}
            </span>
            <span className="tabular-nums">
              {index + 1} / {questions.length}
            </span>
          </div>
          <ProgressBar value={index / questions.length} className="mb-5" />

          <motion.div
            key={index}
            initial={reduce ? false : { opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-line bg-panel py-10 text-center"
          >
            <button
              onClick={() => speakEnabled && speakJapanese(q.prompt)}
              className={`font-jp text-5xl font-bold ${
                speakEnabled ? "transition-transform hover:scale-105" : ""
              }`}
            >
              {q.prompt}
            </button>
            {q.alt && <div className="mt-2 text-sm text-muted">{q.alt}</div>}
            <div className="mt-2 text-xs text-muted">{subtitles[direction]}</div>

            <div className="mt-8 grid gap-2 px-6" role="group" aria-label="Answer options">
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
                    onClick={() => pick(o)}
                    disabled={!!picked}
                    className={`press rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors disabled:cursor-default ${cls}`}
                  >
                    <span>{o}</span>
                    <kbd className="kbd ml-1.5">{i + 1}</kbd>
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
                          <span className="text-red-400">It was “{q.answer}”</span>
                        </>
                      )}
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
    </div>
  );
}
