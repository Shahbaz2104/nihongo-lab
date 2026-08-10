"use client";

import { useState } from "react";
import { FlashcardReview } from "@/components/FlashcardReview";
import { LevelSelector } from "@/components/LevelSelector";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";

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
        <h1 className="text-2xl font-bold tracking-tight">Review</h1>
        <p className="mt-1 text-sm text-muted">Spaced-repetition flashcards powered by SM-2.</p>
      </header>

      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          options={types}
          value={type}
          onChange={(id) => {
            setType(id);
            setSession((s) => s + 1);
          }}
        />
        <LevelSelector
          value={level}
          onChange={(l) => {
            setLevel(l);
            setSession((s) => s + 1);
          }}
        />
        <Button variant="secondary" size="sm" onClick={() => setSession((s) => s + 1)}>
          New session
        </Button>
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
