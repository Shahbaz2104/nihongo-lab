"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { CheckCircle, Trophy, XCircle } from "@phosphor-icons/react";
import type { Token } from "@/lib/tokenizer";
import { HoverText } from "@/components/HoverText";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";

export interface StorySentence {
  jp: string;
  en: string;
  tokens: Token[];
}

export interface Story {
  id: string;
  title: string;
  titleEn: string;
  level: string;
  sentences: StorySentence[];
}

export interface ConversationChoice {
  jp: string;
  en: string;
  tokens: Token[];
  correct: boolean;
}

export interface ConversationTurn {
  speaker: string;
  jp: string;
  en: string;
  tokens: Token[];
  options: ConversationChoice[];
}

export interface Conversation {
  id: string;
  title: string;
  titleEn: string;
  level: string;
  turns: ConversationTurn[];
}

interface Props {
  stories: Story[];
  conversations: Conversation[];
}

function useActiveSentence(count: number) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (count === 0) return;
    const els = Array.from(document.querySelectorAll<HTMLElement>("[data-sentence]"));
    const obs = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setActive(Number((e.target as HTMLElement).dataset.sentence));
          }
        }
      },
      { rootMargin: "-25% 0px -65% 0px" },
    );
    els.forEach((el) => obs.observe(el));
    return () => obs.disconnect();
  }, [count]);

  return active;
}

function StoryView({ story }: { story: Story }) {
  const [showEn, setShowEn] = useState(false);
  const active = useActiveSentence(story.sentences.length);

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-jp text-2xl font-bold">{story.title}</h2>
            <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
              {story.level}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{story.titleEn}</p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={showEn}
              onChange={(e) => setShowEn(e.target.checked)}
              className="accent-[--color-accent]"
            />
            Show English
          </label>
          <SpeakButton
            text={story.sentences.map((s) => s.jp)}
            label="Listen to whole story"
          />
        </div>
      </div>

      <div className="flex items-center gap-2">
        <ProgressBar value={(active + 1) / story.sentences.length} className="flex-1" />
        <span className="text-xs tabular-nums text-muted">
          sentence {active + 1} / {story.sentences.length}
        </span>
      </div>

      <div className="space-y-4">
        {story.sentences.map((s, i) => (
          <motion.div
            key={i}
            data-sentence={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className={`rounded-2xl border p-4 transition-colors ${
              i === active ? "border-accent/50 bg-panel" : "border-line bg-panel/60 hover:border-accent/40"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 w-6 shrink-0 text-right text-xs tabular-nums text-muted">
                {i + 1}
              </span>
              <HoverText
                tokens={s.tokens}
                className="flex-1 font-jp text-xl leading-relaxed tracking-wide"
              />
              <SpeakButton text={s.jp} size="sm" label={`Listen to sentence ${i + 1}`} />
            </div>
            {showEn && (
              <motion.p
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 pl-9 text-sm leading-relaxed text-muted"
              >
                {s.en}
              </motion.p>
            )}
          </motion.div>
        ))}
      </div>

      <p className="text-xs text-muted/70">
        Tip: hover or tap any word to see its reading, romaji, and meaning.
      </p>
    </div>
  );
}

function ConversationView({ conversation }: { conversation: Conversation }) {
  const [ptr, setPtr] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const reduce = useReducedMotion();

  const done = ptr >= conversation.turns.length;
  const current = done ? null : conversation.turns[ptr];
  const isChoice = current && current.options.length > 0;

  const restart = () => {
    setPtr(0);
    setSelected(null);
    setScore(0);
  };

  const choose = (i: number) => {
    if (!current || selected !== null) return;
    setSelected(i);
    if (current.options[i].correct) setScore((s) => s + 1);
  };

  const next = () => {
    setSelected(null);
    setPtr((p) => p + 1);
  };

  if (done) {
    const total = conversation.turns.filter((t) => t.options.length > 0).length;
    const pct = total === 0 ? 0 : Math.round((score / total) * 100);
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-panel px-6 py-14 text-center">
        <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft">
          <Trophy size={30} weight="duotone" className="text-accent" />
        </div>
        <div className="font-jp text-4xl font-bold">おつかれさま</div>
        <div className="mt-4 text-3xl font-bold tabular-nums">{pct}%</div>
        <p className="mt-2 text-sm text-muted">
          You answered {score} of {total} choices correctly.
        </p>
        <Button className="mt-8" onClick={restart}>
          Try again
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="font-jp text-2xl font-bold">{conversation.title}</h2>
            <span className="rounded-md bg-accent-soft px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-accent">
              {conversation.level}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted">{conversation.titleEn}</p>
        </div>
        <div className="text-right text-xs text-muted">
          <div>score</div>
          <div className="font-jp text-lg text-accent">{score}</div>
        </div>
      </div>

      <div className="space-y-3">
        {conversation.turns.slice(0, ptr + 1).map((t, i) => {
          const isCurrent = i === ptr;
          const chosen = t.options.length > 0 ? selected : null;
          return (
            <div
              key={i}
              className={`flex items-start gap-3 rounded-2xl border p-4 ${
                isCurrent ? "border-accent/40 bg-panel" : "border-line bg-panel/50"
              }`}
            >
              <span
                className={`mt-1 w-16 shrink-0 rounded-md px-2 py-0.5 text-center text-[10px] font-semibold ${
                  t.speaker === "あなた"
                    ? "bg-indigo/15 text-indigo"
                    : "bg-accent-soft text-accent"
                }`}
              >
                {t.speaker}
              </span>
              <div className="min-w-0 flex-1">
                <HoverText
                  tokens={
                    t.options.length > 0 && chosen !== null
                      ? t.options[chosen].tokens
                      : t.tokens
                  }
                  className="font-jp text-lg leading-relaxed"
                />
                <div className="mt-1 text-sm text-muted">
                  {t.options.length > 0 && chosen !== null
                    ? t.options[chosen].en
                    : t.en}
                </div>
              </div>
              {!isCurrent && <SpeakButton text={t.jp} size="sm" />}
            </div>
          );
        })}
      </div>

      {isChoice && current && (
        <div className="space-y-2">
          {current.options.map((opt, i) => {
            let style =
              "border-line text-foreground hover:border-accent/60 hover:bg-accent-soft/40";
            if (selected !== null) {
              if (opt.correct) style = "border-good/50 bg-good/10 text-good";
              else if (i === selected) style = "border-red-500/50 bg-red-500/10 text-red-400";
              else style = "border-line text-muted opacity-60";
            }
            return (
              <button
                key={i}
                onClick={() => choose(i)}
                disabled={selected !== null}
                className={`press flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors disabled:cursor-default ${style}`}
              >
                <span className="text-xs text-muted">{i + 1}.</span>
                <HoverText tokens={opt.tokens} className="font-jp text-base" />
                <span className="ml-auto hidden text-xs text-muted sm:block">{opt.en}</span>
              </button>
            );
          })}

          <AnimatePresence>
            {selected !== null && (
              <motion.div
                initial={reduce ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel-2 px-4 py-3"
                aria-live="polite"
              >
                <span className="flex items-center gap-2 text-sm">
                  {current.options[selected].correct ? (
                    <>
                      <CheckCircle size={16} weight="bold" className="shrink-0 text-good" />
                      <span className="text-good">Correct!</span>
                    </>
                  ) : (
                    <>
                      <XCircle size={16} weight="bold" className="shrink-0 text-red-400" />
                      <span className="text-red-400">
                        Not quite — the natural reply is{" "}
                        <span className="font-jp text-foreground">
                          {current.options.find((o) => o.correct)?.jp}
                        </span>
                      </span>
                    </>
                  )}
                </span>
                <Button size="sm" onClick={next}>
                  Continue
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {current && !isChoice && (
        <Button size="sm" onClick={next}>
          Continue
        </Button>
      )}
    </div>
  );
}

export function StoryReader({ stories, conversations }: Props) {
  const [tab, setTab] = useState<"reading" | "conversation">("reading");
  const [storyIdx, setStoryIdx] = useState(0);
  const [convIdx, setConvIdx] = useState(0);

  return (
    <div className="space-y-6">
      <SegmentedControl
        options={[
          { id: "reading", label: "Reading" },
          { id: "conversation", label: "Conversation" },
        ]}
        value={tab}
        onChange={(id) => setTab(id as "reading" | "conversation")}
      />

      {tab === "reading" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {stories.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStoryIdx(i)}
                className={`press rounded-xl border px-4 py-2 text-left transition-colors ${
                  storyIdx === i
                    ? "border-accent bg-accent-soft text-foreground"
                    : "border-line bg-panel text-muted hover:border-accent/50 hover:text-foreground"
                }`}
              >
                <span className="font-jp text-sm">{s.title}</span>
                <span className="ml-2 text-[10px] uppercase tracking-wider text-muted/70">
                  {s.level}
                </span>
              </button>
            ))}
          </div>
          <StoryView key={stories[storyIdx].id} story={stories[storyIdx]} />
        </div>
      )}

      {tab === "conversation" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {conversations.map((c, i) => (
              <button
                key={c.id}
                onClick={() => setConvIdx(i)}
                className={`press rounded-xl border px-4 py-2 text-left transition-colors ${
                  convIdx === i
                    ? "border-accent bg-accent-soft text-foreground"
                    : "border-line bg-panel text-muted hover:border-accent/50 hover:text-foreground"
                }`}
              >
                <span className="font-jp text-sm">{c.title}</span>
                <span className="ml-2 text-[10px] uppercase tracking-wider text-muted/70">
                  {c.level}
                </span>
              </button>
            ))}
          </div>
          <ConversationView key={conversations[convIdx].id} conversation={conversations[convIdx]} />
        </div>
      )}
    </div>
  );
}
