"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import type { KanaItem } from "@/lib/datasets";
import { speakJapanese } from "@/lib/tts";

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
  const [result, setResult] = useState<"correct" | "wrong" | null>(null);
  const [score, setScore] = useState({ correct: 0, total: 0 });

  const pool = useMemo(() => kana.filter((k) => k.type === type), [kana, type]);

  const pick = () => {
    const { current, options } = sample(pool);
    setCurrent(current);
    setOptions(options);
    setResult(null);
  };

  const switchMode = (m: Mode) => {
    setMode(m);
    if (m === "drill" && current === null) pick();
  };

  const switchType = (t: "hiragana" | "katakana") => {
    setType(t);
    if (mode === "drill") pick();
  };

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
          <h1 className="text-2xl font-bold">Kana</h1>
          <p className="mt-1 text-sm text-muted">Hiragana and katakana charts + recognition drills.</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1 rounded-xl border border-line bg-panel p-1">
            {(["hiragana", "katakana"] as const).map((t) => (
              <button
                key={t}
                onClick={() => switchType(t)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  type === t ? "bg-accent text-black" : "text-muted hover:text-foreground"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="flex gap-1 rounded-xl border border-line bg-panel p-1">
            {(["chart", "drill"] as const).map((m) => (
              <button
                key={m}
                onClick={() => switchMode(m)}
                className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  mode === m ? "bg-accent text-black" : "text-muted hover:text-foreground"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
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
                    className="rounded-xl border border-line bg-panel py-4 transition-colors hover:border-accent"
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
          <div className="mb-4 text-center text-xs text-muted">
            score: {score.correct} / {score.total}
          </div>
          {current && (
            <motion.div
              key={current.char}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl border border-line bg-panel py-12 text-center"
            >
              <div className="mb-2 text-xs text-muted">What romaji is this?</div>
              <button
                onClick={() => speakJapanese(current.char)}
                className="font-jp text-7xl text-foreground transition-transform hover:scale-105"
              >
                {current.char}
              </button>

              <div className="mt-8 grid grid-cols-2 gap-2 px-6">
                {options.map((o) => (
                  <button
                    key={o}
                    disabled={result !== null}
                    onClick={() => {
                      const correct = o === current.romaji;
                      setResult(correct ? "correct" : "wrong");
                      setScore((s) => ({ correct: s.correct + (correct ? 1 : 0), total: s.total + 1 }));
                      if (correct) speakJapanese(current.char);
                    }}
                    className={`rounded-xl border px-4 py-3 font-semibold transition-colors ${
                      result === null
                        ? "border-line bg-panel hover:border-accent"
                        : o === current.romaji
                          ? "border-good/50 bg-good/15 text-good"
                          : o === current.romaji || result === "wrong"
                            ? "border-line bg-panel opacity-50"
                            : "border-line bg-panel opacity-50"
                    }`}
                  >
                    {o}
                  </button>
                ))}
              </div>

              {result && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-6"
                >
                  <div className={result === "correct" ? "text-good" : "text-red-400"}>
                    {result === "correct" ? "Correct!" : `It was ${current.romaji}`}
                  </div>
                  <button
                    onClick={pick}
                    className="mt-4 rounded-xl bg-accent px-6 py-2.5 font-medium text-black transition-opacity hover:opacity-90"
                  >
                    Next
                  </button>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      )}
    </div>
  );
}
