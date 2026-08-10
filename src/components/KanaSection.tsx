"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { KanaItem } from "@/lib/datasets";
import { speakJapanese } from "@/lib/tts";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Button } from "@/components/ui/Button";

type Mode = "chart" | "drill";

function sample(pool: KanaItem[]): { current: KanaItem; options: string[] } {
  const correct = pool[Math.floor(Math.random() * pool.length)];
  const options = pool
    .filter((k) => k.romaji !== correct.romaji)
    .sort(() => Math.random() - 0.5)
    .slice(0, 3)
    .map((k) => k.romaji)
    .concat(correct.romaji)
    .sort(() => Math.random() - 0.5);
  return { current: correct, options };
}

export function KanaSection({ kana }: { kana: KanaItem[] }) {
  const [mode, setMode] = useState<Mode>("chart");
  const [type, setType] = useState<"hiragana" | "katakana">("hiragana");
  const [current, setCurrent] = useState<KanaItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [picked, setPicked] = useState<string | null>(null);
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });
  const reduce = useReducedMotion();

  const pool = useMemo(() => kana.filter((k) => k.type === type), [kana, type]);

  const pick = () => {
    const { current, options } = sample(pool);
    setCurrent(current);
    setOptions(options);
    setPicked(null);
    setResult(null);
  };

  const switchMode = (m: string) => {
    const next = m as Mode;
    setMode(next);
    if (next === "drill" && current === null) pick();
  };

  const switchType = (t: string) => {
    setType(t as "hiragana" | "katakana");
    if (mode === "drill") pick();
  };

  const choose = (o: string) => {
    if (result !== null || !current) return;
    const correct = o === current.romaji;
    setPicked(o);
    setResult(correct ? "correct" : "wrong");
    setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
    if (correct) speakJapanese(current.char);
  };

  useEffect(() => {
    if (mode !== "drill" || !current || result !== null) return;
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && ["INPUT", "TEXTAREA", "SELECT"].includes(t.tagName)) return;
      if (["1", "2", "3", "4"].includes(e.key)) {
        const idx = Number(e.key) - 1;
        if (options[idx]) {
          e.preventDefault();
          choose(options[idx]);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const groups = useMemo(() => {
    const map = new Map<string, KanaItem[]>();
    for (const k of pool) {
      map.set(k.group, [...(map.get(k.group) ?? []), k]);
    }
    return [...map.entries()];
  }, [pool]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Kana</h1>
          <p className="mt-1 text-sm text-muted">Hiragana and katakana charts + recognition drills.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <SegmentedControl
            options={[
              { id: "hiragana", label: "Hiragana" },
              { id: "katakana", label: "Katakana" },
            ]}
            value={type}
            onChange={switchType}
          />
          <SegmentedControl
            options={[
              { id: "chart", label: "Chart" },
              { id: "drill", label: "Drill" },
            ]}
            value={mode}
            onChange={switchMode}
          />
        </div>
      </header>

      {mode === "chart" ? (
        <div className="space-y-5">
          {groups.map(([group, items]) => (
            <div key={group}>
              <div className="mb-2 text-xs uppercase tracking-widest text-muted">
                {group === "vowel" ? "Vowels" : `${group}-row`}
              </div>
              <div className="grid grid-cols-4 gap-2 sm:grid-cols-5">
                {items.map((k) => (
                  <button
                    key={k.char}
                    onClick={() => speakJapanese(k.char)}
                    className="press rounded-xl border border-line bg-panel py-4 transition-colors hover:border-accent"
                    title={k.romaji}
                  >
                    <div className="font-jp text-3xl text-foreground">{k.char}</div>
                    <div className="mt-1 text-xs text-muted">{k.romaji}</div>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="mx-auto max-w-md">
          <div className="mb-3">
            <div className="mb-1 flex items-center justify-between text-xs text-muted">
              <span>
                score: {score.correct} / {score.total}
              </span>
              <span className="tabular-nums">{score.total === 0 ? "0%" : Math.round((score.correct / score.total) * 100)}%</span>
            </div>
            <ProgressBar value={score.total === 0 ? 0 : score.correct / score.total} />
          </div>

          {current ? (
            <motion.div
              key={current.char}
              initial={reduce ? false : { opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-line bg-panel py-12 text-center"
            >
              <div className="mb-2 text-xs text-muted">What romaji is this?</div>
              <button
                onClick={() => speakJapanese(current.char)}
                className="font-jp text-7xl text-foreground transition-transform hover:scale-105"
                aria-label="Listen"
                title="Listen"
              >
                {current.char}
              </button>

              <div className="mt-8 grid grid-cols-2 gap-2 px-6" role="group" aria-label="Options">
                {options.map((o, i) => {
                  let style = "border-line bg-panel hover:border-accent";
                  if (result !== null) {
                    if (o === current.romaji) style = "border-good/50 bg-good/15 text-good";
                    else if (result === "wrong" && o === picked) style = "border-red-500/50 bg-red-500/15 text-red-400";
                    else style = "border-line bg-panel opacity-50";
                  }
                  return (
                    <button
                      key={o}
                      disabled={result !== null}
                      onClick={() => choose(o)}
                      className={`press rounded-xl border px-4 py-3 font-semibold transition-colors disabled:cursor-default ${style}`}
                    >
                      <span>{o}</span>
                      <kbd className="kbd ml-1.5">{i + 1}</kbd>
                    </button>
                  );
                })}
              </div>

              <div aria-live="polite">
                <AnimatePresence>
                  {result && (
                    <motion.div
                      initial={reduce ? false : { opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className="mt-6"
                    >
                      <div className={result === "correct" ? "text-good" : "text-red-400"}>
                        {result === "correct" ? "Correct!" : `It was ${current.romaji}`}
                      </div>
                      <Button className="mt-4" onClick={pick}>
                        Next
                      </Button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ) : (
            <div className="rounded-2xl border border-line bg-panel py-12 text-center">
              <p className="text-sm text-muted">Pick a kana from the chart to start drilling, or switch to Drill.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
