"use client";

import { useState } from "react";
import { Plus } from "@phosphor-icons/react";
import type { Token } from "@/lib/tokenizer";
import { Furigana } from "@/components/Furigana";
import { api } from "@/lib/api";

export function HoverText({
  tokens,
  className,
  furigana = true,
  romaji = true,
}: {
  tokens: Token[];
  className?: string;
  furigana?: boolean;
  romaji?: boolean;
}) {
  const [open, setOpen] = useState<number | null>(null);
  const [saved, setSaved] = useState<number | null>(null);

  const addToReview = async (t: Token, i: number) => {
    try {
      await api.addCard({
        type: "vocab",
        sourceId: t.text,
        front: t.text,
        back: t.meanings.join("; ") || t.reading,
        reading: t.reading,
      });
      setSaved(i);
    } catch {
      setSaved(-1);
    }
  };

  return (
    <span className={className}>
      {tokens.map((t, i) => {
        const hint = t.reading && t.meanings.length > 0;
        if (!hint) return <span key={i}>{t.text}</span>;

        const align = i === 0
          ? "left-0"
          : i === tokens.length - 1
            ? "right-0"
            : "left-1/2 -translate-x-1/2";

        const isOpen = open === i;

        return (
          <span key={i} className="group/word relative mx-0.5 inline-block">
            <button
              type="button"
              aria-expanded={isOpen}
              aria-label={`${t.text} (${t.reading}) — ${t.meanings.slice(0, 3).join(", ")}`}
              onClick={(e) => {
                e.stopPropagation();
                setOpen(isOpen ? null : i);
              }}
              onFocus={() => setOpen(i)}
              onBlur={(e) => {
                if (!e.currentTarget.nextElementSibling?.contains(e.relatedTarget as Node)) {
                  setOpen((cur) => (cur === i ? null : cur));
                }
              }}
              onKeyDown={(e) => {
                if (e.key === "Escape") {
                  e.preventDefault();
                  setOpen(null);
                }
              }}
              className="cursor-help rounded-sm transition-colors hover:bg-accent-soft focus-visible:bg-accent-soft"
            >
              {furigana ? (
                <Furigana word={t.text} reading={t.reading} />
              ) : (
                <span className="font-jp">{t.text}</span>
              )}
            </button>
            <span
              role="tooltip"
              className={`absolute top-full z-30 mt-2 w-max max-w-[min(16rem,72vw)] whitespace-normal rounded-xl border border-line bg-panel-2/95 px-3 py-2 text-left shadow-2xl shadow-black/60 backdrop-blur-sm ${align} ${
                isOpen ? "block" : "hidden group-hover/word:block"
              }`}
            >
              <span className="mb-1 flex flex-wrap items-baseline gap-x-2 text-xs">
                <span className="font-jp text-sm font-bold text-accent">{t.text}</span>
                <span className="font-jp text-foreground/90">{t.reading}</span>
                {romaji && (
                  <span className="text-[10px] uppercase tracking-wider text-indigo">{t.romaji}</span>
                )}
              </span>
              <span className="block text-xs leading-snug text-muted">
                {t.meanings.slice(0, 3).join(" · ")}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToReview(t, i);
                }}
                disabled={saved === i || saved === -1}
                className={`mt-2 flex items-center gap-1 rounded-md border px-2 py-1 text-[10px] font-semibold transition-colors ${
                  saved === i
                    ? "border-good/40 bg-good/10 text-good"
                    : saved === -1
                      ? "cursor-not-allowed border-red-500/40 text-bad"
                      : "border-line bg-panel text-muted hover:border-accent hover:text-foreground"
                }`}
              >
                <Plus size={10} weight="bold" />
                {saved === i ? "Added to review" : saved === -1 ? "Failed" : "Add to review"}
              </button>
            </span>
          </span>
        );
      })}
    </span>
  );
}
