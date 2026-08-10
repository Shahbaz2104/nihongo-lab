"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { Token } from "@/lib/tokenizer";
import { HoverText } from "@/components/HoverText";
import { speakJapanese } from "@/lib/tts";

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

function SpeakButton({ text, size = "md" }: { text: string; size?: "sm" | "md" }) {
  const [playing, setPlaying] = useState(false);
  return (
    <button
      onClick={() => {
        if (playing) return;
        setPlaying(true);
        speakJapanese(text).finally(() => setPlaying(false));
      }}
      className={`grid shrink-0 place-items-center rounded-lg border border-line text-muted transition-colors hover:border-accent hover:text-accent ${
        size === "sm" ? "h-7 w-7 text-xs" : "h-9 w-9 text-sm"
      }`}
      aria-label="Speak"
    >
      {playing ? "…" : "🔊"}
    </button>
  );
}

function StoryView({ story }: { story: Story }) {
  const [showEn, setShowEn] = useState(false);

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
        <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
          <input
            type="checkbox"
            checked={showEn}
            onChange={(e) => setShowEn(e.target.checked)}
            className="accent-[--color-accent]"
          />
          Show English
        </label>
      </div>

      <div className="space-y-4">
        {story.sentences.map((s, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04 }}
            className="group rounded-2xl border border-line bg-panel p-4"
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 w-6 shrink-0 text-right text-xs tabular-nums text-muted">
                {i + 1}
              </span>
              <HoverText
                tokens={s.tokens}
                className="flex-1 font-jp text-xl leading-relaxed tracking-wide"
              />
              <SpeakButton text={s.jp} />
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
        Tip: hover any word to see its reading, romaji, and meaning.
      </p>
    </div>
  );
}

function ConversationView({ conversation }: { conversation: Conversation }) {
  const [ptr, setPtr] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [score, setScore] = useState(0);

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
    return (
      <div className="mx-auto max-w-lg rounded-2xl border border-line bg-panel py-14 text-center">
        <div className="mb-3 font-jp text-5xl">おつかれさまでした 🎉</div>
        <p className="text-muted">
          You answered {score} of {conversation.turns.filter((t) => t.options.length > 0).length}{" "}
          choices correctly.
        </p>
        <button
          onClick={restart}
          className="mt-8 rounded-xl bg-accent px-6 py-3 font-medium text-black transition-opacity hover:opacity-90"
        >
          Try again
        </button>
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
                className={`flex w-full items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${style}`}
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
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-between gap-3 rounded-xl border border-line bg-panel-2 px-4 py-3"
              >
                <span className="text-sm">
                  {current.options[selected].correct ? (
                    <span className="text-good">Correct!</span>
                  ) : (
                    <span className="text-red-400">
                      Not quite — the natural reply is «{" "}
                      <span className="font-jp text-foreground">
                        {current.options.find((o) => o.correct)?.jp}
                      </span>{" "}
                      »
                    </span>
                  )}
                </span>
                <button
                  onClick={next}
                  className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
                >
                  Continue →
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {current && !isChoice && (
        <button
          onClick={next}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black transition-opacity hover:opacity-90"
        >
          Continue →
        </button>
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
      <div className="flex gap-1 rounded-xl border border-line bg-panel p-1">
        {(
          [
            ["reading", "Reading"],
            ["conversation", "Conversation"],
          ] as const
        ).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              tab === key ? "bg-accent text-black" : "text-muted hover:text-foreground"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {tab === "reading" && (
        <div className="space-y-6">
          <div className="flex flex-wrap gap-2">
            {stories.map((s, i) => (
              <button
                key={s.id}
                onClick={() => setStoryIdx(i)}
                className={`rounded-xl border px-4 py-2 text-left transition-colors ${
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
                className={`rounded-xl border px-4 py-2 text-left transition-colors ${
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
