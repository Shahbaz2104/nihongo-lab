"use client";

import { useEffect, useMemo, useState } from "react";
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
  why?: string;
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
  initialTab?: "reading" | "conversation";
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

function useStoryProgress(storyId: string, total: number) {
  const KEY = `nl-story-progress:${storyId}`;
  const [furthest, setFurthest] = useState(() => {
    if (typeof window === "undefined") return -1;
    try {
      const n = Number(window.localStorage.getItem(KEY));
      return Number.isFinite(n) && n >= 0 && n < total ? n : -1;
    } catch {
      return -1;
    }
  });

  const mark = (idx: number) => {
    if (idx > furthest) {
      setFurthest(idx);
      try {
        window.localStorage.setItem(KEY, String(idx));
      } catch {
        /* storage may be unavailable (private mode) */
      }
    }
  };

  const reset = () => {
    setFurthest(-1);
    try {
      window.localStorage.removeItem(KEY);
    } catch {
      /* noop */
    }
  };

  return { furthest, mark, reset };
}

function StoryView({ story }: { story: Story }) {
  const [showEn, setShowEn] = useState(false);
  const [showFurigana, setShowFurigana] = useState(true);
  const [showRomaji, setShowRomaji] = useState(true);
  const active = useActiveSentence(story.sentences.length);
  const { furthest, mark, reset } = useStoryProgress(story.id, story.sentences.length);
  const complete = furthest === story.sentences.length - 1;

  useEffect(() => {
    mark(active);
  }, [active, mark]);

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
        <div className="flex flex-wrap items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={showEn}
              onChange={(e) => setShowEn(e.target.checked)}
              className="accent-[--color-accent]"
            />
            English
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={showFurigana}
              onChange={(e) => setShowFurigana(e.target.checked)}
              className="accent-[--color-accent]"
            />
            ふりがな
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-xs text-muted">
            <input
              type="checkbox"
              checked={showRomaji}
              onChange={(e) => setShowRomaji(e.target.checked)}
              className="accent-[--color-accent]"
            />
            Romaji
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

      {furthest >= 0 && (
        <div className="flex items-center justify-between rounded-xl border border-line bg-panel px-4 py-2 text-xs text-muted">
          <span>
            {complete
              ? "この物語を読み終えました — story complete"
              : furthest + 1 < story.sentences.length
                ? `Furthest read: sentence ${furthest + 1} of ${story.sentences.length}`
                : "この物語を読み終えました — story complete"}
          </span>
          <button
            onClick={reset}
            className="text-muted underline decoration-dotted underline-offset-2 hover:text-foreground"
          >
            Reset progress
          </button>
        </div>
      )}

      <div className="space-y-4">
        {story.sentences.map((s, i) => (
          <div
            key={i}
            data-sentence={i}
            style={{ animationDelay: `${i * 40}ms` }}
            className={`animate-rise rounded-2xl border p-4 transition-colors ${
              i === active ? "border-accent/50 bg-panel" : "border-line bg-panel/60 hover:border-accent/40"
            }`}
          >
            <div className="flex items-start gap-3">
              <span className="mt-1 w-6 shrink-0 text-right text-xs tabular-nums text-muted">
                {i + 1}
              </span>
              <HoverText
                tokens={s.tokens}
                furigana={showFurigana}
                romaji={showRomaji}
                className="flex-1 font-jp text-xl leading-relaxed tracking-wide"
              />
              <SpeakButton text={s.jp} size="sm" label={`Listen to sentence ${i + 1}`} />
            </div>
            {showEn && (
              <p className="mt-2 animate-rise pl-9 text-sm leading-relaxed text-muted">
                {s.en}
              </p>
            )}
          </div>
        ))}
      </div>

      <p className="text-xs text-muted/70">
        Tip: tap or hover any word to see its reading, romaji, and meaning.
      </p>
    </div>
  );
}

function ConversationView({ conversation }: { conversation: Conversation }) {
  const [ptr, setPtr] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [choices, setChoices] = useState<Record<number, number>>({});
  const [score, setScore] = useState(0);

  const done = ptr >= conversation.turns.length;
  const current = done ? null : conversation.turns[ptr];
  const isChoice = current && current.options.length > 0;

  const restart = () => {
    setPtr(0);
    setSelected(null);
    setChoices({});
    setScore(0);
  };

  const choose = (i: number) => {
    if (!current || selected !== null) return;
    setSelected(i);
    setChoices((c) => ({ ...c, [ptr]: i }));
    if (current.options[i].correct) setScore((s) => s + 1);
  };

  const next = () => {
    setSelected(null);
    setPtr((p) => p + 1);
  };

  const vocabEncountered = useMemo(() => {
    const seen = new Map<string, Token>();
    for (const t of conversation.turns) {
      for (const tok of t.tokens) {
        if (tok.meanings.length > 0 && !seen.has(tok.text)) seen.set(tok.text, tok);
      }
      for (const o of t.options) {
        for (const tok of o.tokens) {
          if (tok.meanings.length > 0 && !seen.has(tok.text)) seen.set(tok.text, tok);
        }
      }
    }
    return Array.from(seen.values()).slice(0, 24);
  }, [conversation]);

  if (done) {
    const total = conversation.turns.filter((t) => t.options.length > 0).length;
    const pct = total === 0 ? 0 : Math.round((score / total) * 100);
    const wrong = total - score;
    const transcriptLines = conversation.turns.map((t, i) => {
      const chosen = t.options.length > 0 ? (choices[i] ?? null) : null;
      return {
        speaker: t.speaker,
        jp: chosen !== null ? t.options[chosen].jp : t.jp,
        en: chosen !== null ? t.options[chosen].en : t.en,
      };
    });

    return (
      <div className="mx-auto max-w-xl space-y-6">
        <div className="rounded-2xl border border-line bg-panel px-6 py-10 text-center">
          <div className="mx-auto mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-accent-soft">
            <Trophy size={30} weight="duotone" className="text-accent" />
          </div>
          <div className="font-jp text-4xl font-bold">おつかれさま</div>
          <div className="mt-4 text-3xl font-bold tabular-nums">{pct}%</div>
          <p className="mt-2 text-sm text-muted">
            {score} of {total} correct · {wrong} incorrect
          </p>
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            <SpeakButton text={transcriptLines.map((l) => l.jp)} label="Replay conversation" />
            <Button onClick={restart}>Try again</Button>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-panel p-5">
          <div className="mb-3 text-sm font-semibold">Vocabulary you met</div>
          {vocabEncountered.length === 0 ? (
            <p className="text-sm text-muted">No words with meanings in this conversation.</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {vocabEncountered.map((t) => (
                <span
                  key={t.text}
                  className="rounded-lg border border-line bg-panel-2 px-2.5 py-1 text-xs"
                  title={`${t.reading} — ${t.meanings.join(" · ")}`}
                >
                  <span className="font-jp text-foreground">{t.text}</span>
                  <span className="ml-1.5 text-muted">{t.meanings[0]}</span>
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-line bg-panel p-5">
          <div className="mb-3 text-sm font-semibold">Transcript</div>
          <div className="space-y-2">
            {transcriptLines.map((l, i) => (
              <div key={i} className="flex items-start gap-3">
                <span
                  className={`mt-1 w-16 shrink-0 rounded-md px-2 py-0.5 text-center text-[10px] font-semibold ${
                    l.speaker === "あなた"
                      ? "bg-indigo/15 text-indigo"
                      : "bg-accent-soft text-accent"
                  }`}
                >
                  {l.speaker}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-jp text-sm leading-relaxed">{l.jp}</div>
                  <div className="text-xs text-muted">{l.en}</div>
                </div>
                <SpeakButton text={l.jp} size="sm" label={`Listen to ${l.speaker}`} />
              </div>
            ))}
          </div>
        </div>
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
        <div className="space-y-2" role="group" aria-label="Choose your reply">
          {current.options.map((opt, i) => {
            let style =
              "border-line text-foreground hover:border-accent/60 hover:bg-accent-soft/40";
            if (selected !== null) {
              if (opt.correct) style = "border-good/50 bg-good/10 text-good";
              else if (i === selected) style = "border-bad/50 bg-bad/10 text-bad";
              else style = "border-line text-muted opacity-60";
            }
            return (
              <div
                key={i}
                role="button"
                tabIndex={selected !== null ? -1 : 0}
                aria-disabled={selected !== null}
                onClick={() => choose(i)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    choose(i);
                  }
                }}
                className={`press flex w-full cursor-pointer items-center gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                  selected !== null ? "cursor-default" : ""
                } ${style}`}
              >
                <span className="text-xs text-muted">{i + 1}.</span>
                <HoverText tokens={opt.tokens} className="font-jp text-base" />
                <span className="ml-auto hidden text-xs text-muted sm:block">{opt.en}</span>
              </div>
            );
          })}

          {selected !== null && (
              <div
                className="animate-rise rounded-xl border border-line bg-panel-2 px-4 py-3"
                aria-live="polite"
              >
                {(() => {
                  const pickedOpt = current.options[selected];
                  const natural = current.options.find((o) => o.correct)!;
                  if (pickedOpt.correct) {
                    return (
                      <div>
                        <span className="flex items-center gap-2 text-sm">
                          <CheckCircle size={16} weight="bold" className="shrink-0 text-good" />
                          <span className="text-good">Correct!</span>
                        </span>
                        {natural.why && (
                          <p className="mt-1.5 text-xs leading-relaxed text-muted">{natural.why}</p>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div>
                      <span className="flex items-center gap-2 text-sm">
                        <XCircle size={16} weight="bold" className="shrink-0 text-bad" />
                        <span className="text-bad">
                          Not quite — the natural reply is{" "}
                          <span className="font-jp text-foreground">{natural.jp}</span>
                        </span>
                      </span>
                      {pickedOpt.why && (
                        <p className="mt-1.5 text-xs leading-relaxed text-muted">{pickedOpt.why}</p>
                      )}
                    </div>
                  );
                })()}
                <div className="mt-3 flex justify-end">
                  <Button size="sm" onClick={next}>
                    Continue
                  </Button>
                </div>
              </div>
            )}
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

export function StoryReader({ stories, conversations, initialTab = "reading" }: Props) {
  const [tab, setTab] = useState<"reading" | "conversation">(initialTab);
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
          {stories.length === 0 ? (
            <EmptyStateLine label="story" />
          ) : (
            <>
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
              <StoryView key={stories[Math.min(storyIdx, stories.length - 1)].id} story={stories[Math.min(storyIdx, stories.length - 1)]} />
            </>
          )}
        </div>
      )}

      {tab === "conversation" && (
        <div className="space-y-6">
          {conversations.length === 0 ? (
            <EmptyStateLine label="conversation" />
          ) : (
            <>
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
              <ConversationView key={conversations[Math.min(convIdx, conversations.length - 1)].id} conversation={conversations[Math.min(convIdx, conversations.length - 1)]} />
            </>
          )}
        </div>
      )}
    </div>
  );
}

function EmptyStateLine({ label }: { label: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel px-6 py-12 text-center text-sm text-muted">
      {label === "story"
        ? "No stories available for this level yet."
        : "No conversations available for this level yet."}
    </div>
  );
}
