"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, Cards, ChartBar, CheckCircle, ChatCircleDots, BookOpen, Plus, Quotes, Trophy } from "@phosphor-icons/react";
import { api, type NewWord } from "@/lib/api";
import { FlashcardReview } from "@/components/FlashcardReview";
import { Quiz } from "@/components/Quiz";
import { StoryReader, type Story, type Conversation } from "@/components/StoryReader";
import { LevelSelector } from "@/components/LevelSelector";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { Button } from "@/components/ui/Button";
import { Skeleton } from "@/components/ui/Skeleton";

interface Props {
  stories: Story[];
  conversations: Conversation[];
}

const steps = [
  { id: "review", label: "Review", icon: Cards },
  { id: "vocab", label: "New vocabulary", icon: Plus },
  { id: "reading", label: "Reading", icon: BookOpen },
  { id: "quiz", label: "Quiz", icon: Trophy },
  { id: "conversation", label: "Conversation", icon: ChatCircleDots },
];

export function Session({ stories, conversations }: Props) {
  const [level, setLevel] = useState("N5");
  const [step, setStep] = useState(-1);

  if (step === -1) {
    return (
      <div className="mx-auto max-w-lg space-y-6">
        <div className="text-center">
          <div className="font-jp text-4xl font-bold">今日の日本語</div>
          <p className="mt-2 text-muted">Today’s Japanese — one guided session through review, new words, reading, quiz, and conversation.</p>
        </div>
        <div className="rounded-2xl border border-line bg-panel p-6">
          <div className="text-xs uppercase tracking-widest text-muted">Your level</div>
          <div className="mt-3">
            <LevelSelector value={level} onChange={setLevel} />
          </div>
        </div>
        <ol className="space-y-2">
          {steps.map((s) => {
            const Icon = s.icon;
            return (
              <li key={s.id} className="flex items-center gap-3 rounded-xl border border-line bg-panel px-4 py-3">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-panel-2 text-accent">
                  <Icon size={16} weight="duotone" />
                </span>
                <span className="flex-1 text-sm font-medium">{s.label}</span>
                <span className="text-xs text-muted">
                  {s.id === "review" ? "due cards" : s.id === "vocab" ? "5 new words" : s.id === "quiz" ? "5 questions" : "1 session"}
                </span>
              </li>
            );
          })}
        </ol>
        <Button className="w-full" onClick={() => setStep(0)}>
          Start today2019s session
          <ArrowRight size={18} weight="bold" />
        </Button>
      </div>
    );
  }

  if (step === steps.length) {
    return <SessionResult onRestart={() => setStep(-1)} />;
  }

  return (
    <div className="space-y-6">
      <header>
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-bold tracking-tight">Today’s session</h1>
          <span className="rounded-lg bg-panel px-2 py-1 text-xs font-semibold text-muted">
            {step + 1} / {steps.length}
          </span>
        </div>
        <ol className="mt-4 flex items-center gap-1.5" aria-label="Session progress">
          {steps.map((s, i) => {
            const Icon = s.icon;
            return (
              <li
                key={s.id}
                title={s.label}
                aria-current={i === step ? "step" : undefined}
                className={`grid h-8 w-8 place-items-center rounded-lg transition-colors ${
                  i < step
                    ? "bg-good/15 text-good"
                    : i === step
                      ? "bg-accent text-black"
                      : "bg-panel-2 text-muted"
                }`}
              >
                {i < step ? <CheckCircle size={15} weight="bold" /> : <Icon size={15} weight="duotone" />}
              </li>
            );
          })}
        </ol>
      </header>

      {step === 0 && (
        <FlashcardReview type="vocab" level={level} limit={10} onComplete={() => setStep(1)} onRestart={() => setStep(1)} />
      )}
      {step === 1 && <NewWordsStep level={level} onDone={() => setStep(2)} />}
      {step === 2 && (
        <>
          <StoryReader stories={stories} conversations={conversations} initialTab="reading" />
          <div className="flex justify-center">
            <Button onClick={() => setStep(3)}>
              Finished reading — continue
              <ArrowRight size={18} weight="bold" />
            </Button>
          </div>
        </>
      )}
      {step === 3 && <Quiz initialType="vocab" initialLevel={level} onComplete={() => setStep(4)} />}
      {step === 4 && (
        <>
          <StoryReader stories={stories} conversations={conversations} initialTab="conversation" />
          <div className="flex justify-center">
            <Button onClick={() => setStep(5)}>
              Finished — see results
              <ArrowRight size={18} weight="bold" />
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function NewWordsStep({ level, onDone }: { level: string; onDone: () => void }) {
  const [words, setWords] = useState<NewWord[] | null>(null);
  const [idx, setIdx] = useState(0);
  const [added, setAdded] = useState(0);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let alive = true;
    api
      .sessionNewWords(level, 5)
      .then(({ words }) => {
        if (alive) setWords(words);
      })
      .catch(() => {
        if (alive) setWords([]);
      });
    return () => {
      alive = false;
    };
  }, [level]);

  if (words === null) {
    return (
      <div className="mx-auto max-w-lg space-y-3">
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  const w = words[idx];
  if (!w) {
    return (
      <div className="mx-auto max-w-md rounded-2xl border border-line bg-panel px-6 py-12 text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft">
          <Plus size={30} weight="duotone" className="text-accent" />
        </div>
        <div className="font-jp text-3xl font-bold">おつかれさま</div>
        <p className="mt-3 text-muted">
          {added > 0
            ? `${added} new word${added === 1 ? "" : "s"} added to your reviews.`
            : "No new words this time — they2019ll show up once you review them."}
        </p>
        <Button className="mt-8" onClick={onDone}>
          Continue session
          <ArrowRight size={18} weight="bold" />
        </Button>
      </div>
    );
  }

  const add = async () => {
    setSaving(true);
    try {
      await api.addCard({
        type: "vocab",
        sourceId: w.word,
        front: w.kanji ?? w.word,
        back: w.meanings.join("; ") || w.word,
        reading: w.reading,
        level,
      });
      setAdded((a) => a + 1);
      setIdx((i) => i + 1);
    } catch {
      // keep the card on screen so the user can retry
    }
    setSaving(false);
  };

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-4 flex items-center justify-between text-xs text-muted">
        <span className="uppercase tracking-widest">New vocabulary · {level}</span>
        <span className="tabular-nums">
          {idx + 1} / {Math.max(words.length, 1)}
        </span>
      </div>
      <div className="rounded-2xl border border-line bg-panel px-8 py-10 text-center">
        <div className="font-jp text-5xl font-bold tracking-wide">{w.kanji ?? w.word}</div>
        <div className="mt-3 flex items-center justify-center gap-2">
          <span className="font-jp text-xl text-indigo">{w.reading}</span>
          <SpeakButton text={w.word} />
        </div>
        <div className="mt-4 text-lg">{w.meanings.join(" · ")}</div>
        {w.example && (
          <div className="mt-5 rounded-xl bg-panel-2 px-4 py-3 text-left text-sm">
            <div className="font-jp text-base text-foreground/90">{w.example}</div>
            {w.exampleEn && <div className="mt-1 text-xs text-muted">{w.exampleEn}</div>}
          </div>
        )}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Button variant="secondary" onClick={() => setIdx((i) => i + 1)} disabled={saving}>
          Skip
        </Button>
        <Button onClick={add} disabled={saving}>
          <Plus size={18} weight="bold" />
          Add to review
        </Button>
      </div>
    </div>
  );
}

function SessionResult({ onRestart }: { onRestart: () => void }) {
  return (
    <div className="mx-auto max-w-md rounded-2xl border border-line bg-panel px-6 py-12 text-center">
      <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft">
        <Quotes size={30} weight="duotone" className="text-accent" />
      </div>
      <div className="font-jp text-4xl font-bold">お疲れさまでした</div>
      <p className="mt-3 text-muted">
        Session complete. Every review you graded is already saved to your SRS — keep the streak alive.
      </p>
      <div className="mt-8 flex flex-col gap-3">
        <Link
          href="/stats"
          className="press flex items-center justify-center gap-2 rounded-xl border border-line bg-panel-2 px-4 py-3 text-sm font-semibold transition-colors hover:border-accent"
        >
          <ChartBar size={16} weight="duotone" className="text-accent" />
          View statistics
        </Link>
        <Link
          href="/review"
          className="press flex items-center justify-center gap-2 rounded-xl border border-line bg-panel-2 px-4 py-3 text-sm font-semibold transition-colors hover:border-accent"
        >
          <Cards size={16} weight="duotone" className="text-accent" />
          Review more cards
        </Link>
        <Button variant="secondary" onClick={onRestart}>
          Start another session
        </Button>
      </div>
    </div>
  );
}