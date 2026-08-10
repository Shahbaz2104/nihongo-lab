"use client";

import { useState } from "react";
import { FlashcardReview } from "@/components/FlashcardReview";
import { LevelSelector } from "@/components/LevelSelector";

const types = [
  { id: "vocab", label: "Vocab" },
  { id: "kanji", label: "Kanji" },
  { id: "kana", label: "Kana" },
  { id: "grammar", label: "Grammar" },
];

export default function ReviewPage() {
  const [type, setType] = useState("vocab");
  const [level, setLevel] = useState("N5");
  const [session, setSession] = useState(0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Review</h1>
        <p className="mt-1 text-sm text-muted">Spaced-repetition flashcards powered by SM-2.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl border border-line bg-panel p-1">
          {types.map((t) => (
            <button
              key={t.id}
              onClick={() => {
                setType(t.id);
                setSession((s) => s + 1);
              }}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                type === t.id ? "bg-accent text-black" : "text-muted hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <LevelSelector value={level} onChange={setLevel} />
        <button
          onClick={() => setSession((s) => s + 1)}
          className="rounded-xl border border-line bg-panel px-4 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-foreground"
        >
          New session
        </button>
      </div>

      <FlashcardReview
        key={`${type}-${level}-${session}`}
        type={type}
        level={level}
        onRestart={() => setSession((s) => s + 1)}
      />
    </div>
  );
}
