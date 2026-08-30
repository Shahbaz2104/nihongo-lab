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
  const [started, setStarted] = useState(false);

  const changeType = (id: string) => {
    if (id === type) return;
    if (started && !window.confirm("Change type? This resets your current review session.")) return;
    setType(id);
    setStarted(false);
    setSession((s) => s + 1);
  };

  const changeLevel = (l: string) => {
    if (l === level) return;
    if (started && !window.confirm("Change level? This resets your current review session.")) return;
    setLevel(l);
    setStarted(false);
    setSession((s) => s + 1);
  };

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
          onChange={changeType}
        />
        <LevelSelector
          value={level}
          onChange={changeLevel}
        />
        <Button variant="secondary" size="sm" onClick={() => setSession((s) => s + 1)}>
          New session
        </Button>
      </div>

      <FlashcardReview
        key={`${type}-${level}-${session}`}
        type={type}
        level={level}
        onProgress={(n) => {
          if (n > 0) setStarted(true);
        }}
        onRestart={() => {
          setStarted(false);
          setSession((s) => s + 1);
        }}
      />
    </div>
  );
}
