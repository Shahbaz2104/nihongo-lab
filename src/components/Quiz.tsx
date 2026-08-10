"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { api, type QuizQuestion } from "@/lib/api";
import { speakJapanese } from "@/lib/tts";
import { LevelSelector } from "@/components/LevelSelector";

const types = [
  { id: "vocab", label: "Vocab", speak: true },
  { id: "kanji", label: "Kanji", speak: true },
  { id: "grammar", label: "Grammar", speak: false },
];

export function Quiz() {
  const [type, setType] = useState("vocab");
  const [level, setLevel] = useState("N5");
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(true);
  const [done, setDone] = useState(false);
  const [round, setRound] = useState(0);

  useEffect(() => {
    let alive = true;
    api
      .quiz(type, level, 10)
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
  }, [type, level, round]);

  const startNew = () => {
    setRound((r) => r + 1);
    setIndex(0);
    setPicked(null);
    setScore(0);
    setDone(false);
    setLoading(true);
  };

  const q = questions[index];
  const speakEnabled = types.find((t) => t.id === type)?.speak;

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
    startNew();
  };

  const changeLevel = (l: string) => {
    setLevel(l);
    startNew();
  };

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Quiz</h1>
          <p className="mt-1 text-sm text-muted">Multiple-choice on your current level.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex gap-1 rounded-xl border border-line bg-panel p-1">
            {types.map((t) => (
              <button
                key={t.id}
                onClick={() => changeType(t.id)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                  type === t.id ? "bg-accent text-black" : "text-muted hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
          <LevelSelector value={level} onChange={changeLevel} />
          <button
            onClick={startNew}
            className="rounded-xl border border-line bg-panel px-4 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-foreground"
          >
            New quiz
          </button>
        </div>
      </header>

      {loading && <div className="py-20 text-center text-muted">Loading…</div>}

      {!loading && done && (
        <div className="mx-auto max-w-md py-16 text-center">
          <div className="mb-4 font-jp text-5xl">結果</div>
          <div className="text-2xl font-bold">
            {score} / {questions.length}
          </div>
          <p className="mt-2 text-muted">
            {score === questions.length ? "Perfect! 完璧！" : "Keep practicing — 頑張って！"}
          </p>
          <button
            onClick={startNew}
            className="mt-8 rounded-xl bg-accent px-6 py-3 font-medium text-black transition-opacity hover:opacity-90"
          >
            Quiz again
          </button>
        </div>
      )}

      {!loading && !done && q && (
        <div className="mx-auto max-w-lg">
          <div className="mb-4 flex items-center justify-between text-xs text-muted">
            <span className="uppercase tracking-widest">
              {type} · {level}
            </span>
            <span>
              {index + 1} / {questions.length}
            </span>
          </div>

          <motion.div
            key={index}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            className="rounded-2xl border border-line bg-panel py-10 text-center"
          >
            <button
              onClick={() => speakEnabled && speakJapanese(q.prompt)}
              className={`font-jp text-5xl font-bold ${speakEnabled ? "transition-transform hover:scale-105" : ""}`}
            >
              {q.prompt}
            </button>
            {q.alt && <div className="mt-2 text-sm text-muted">{q.alt}</div>}
            <div className="mt-2 text-xs text-muted">What does it mean?</div>

            <div className="mt-8 grid gap-2 px-6">
              {q.options.map((o) => {
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
                    className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition-colors ${cls}`}
                  >
                    {o}
                  </button>
                );
              })}
            </div>

            {picked && (
              <div className="mt-6">
                <div className={picked === q.answer ? "text-good" : "text-red-400"}>
                  {picked === q.answer ? "Correct!" : `It was “${q.answer}”`}
                </div>
                <button
                  onClick={next}
                  className="mt-4 rounded-xl bg-accent px-6 py-2.5 font-medium text-black transition-opacity hover:opacity-90"
                >
                  {index + 1 >= questions.length ? "See results" : "Next"}
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </div>
  );
}
