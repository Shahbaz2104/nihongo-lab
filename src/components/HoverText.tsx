"use client";

import { useEffect, useRef, useState } from "react";
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
  const [saveState, setSaveState] = useState<Record<number, "saving" | "saved" | "error">>({});
  const rootRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (open === null) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(null);
      }
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  const addToReview = async (t: Token, i: number) => {
    if (saveState[i] === "saving" || saveState[i] === "saved") return;
    setSaveState((s) => ({ ...s, [i]: "saving" }));
    try {
      await api.addCard({
        type: "vocab",
        sourceId: t.text,
        front: t.text,
        back: t.meanings.join("; ") || t.reading,
        reading: t.reading,
      });
      setSaveState((s) => ({ ...s, [i]: "saved" }));
    } catch {
      // Per-token failure: other words stay usable, this one can retry.
      setSaveState((s) => ({ ...s, [i]: "error" }));
    }
  };

  return (
    <span ref={rootRef} className={className}>
      {tokens.map((t, i) => {
        const hint = t.reading && t.meanings.length > 0;
        if (!hint) return <span key={i}>{t.text}</span>;

        const align = i === 0
          ? "left-0"
          : i === tokens.length - 1
            ? "right-0"
            : "left-1/2 -translate-x-1/2";

        const isOpen = open === i;
        const st = saveState[i];

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
              onBlur={(e) => {
              const related = e.relatedTarget as Node | null;
              if (related && !e.currentTarget.nextElementSibling?.contains(related)) {
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
              className={`absolute top-full z-[45] mt-2 w-max max-w-[min(18rem,80vw)] whitespace-normal rounded-xl border border-line border-t-accent/70 bg-elevated/95 px-3.5 py-2.5 text-left shadow-2xl shadow-black/60 backdrop-blur-sm ${align} ${
                isOpen ? "block" : "hidden group-hover/word:block"
              }`}
            >
              <span className="mb-1 flex flex-wrap items-baseline gap-x-2 text-xs">
                <span className="font-jp text-sm font-bold text-accent">{t.text}</span>
                <span className="font-jp text-foreground/90">{t.reading}</span>
                {romaji && (
                  <span className="text-[11px] uppercase tracking-wider text-indigo">{t.romaji}</span>
                )}
              </span>
              <span className="block max-w-[min(18rem,80vw)] text-sm leading-snug text-foreground/95">
                {t.meanings.slice(0, 3).join(" · ")}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  addToReview(t, i);
                }}
                disabled={st === "saving" || st === "saved"}
                aria-live="polite"
                className={`mt-2 flex min-h-10 items-center gap-1.5 rounded-md border px-2.5 text-xs font-semibold transition-colors ${
                  st === "saved"
                    ? "border-good/40 bg-good/10 text-good"
                    : st === "error"
                      ? "border-bad/40 bg-bad/10 text-bad hover:bg-bad/15"
                      : "border-line bg-panel text-foreground hover:border-accent"
                }`}
              >
                <Plus size={14} weight="bold" />
                {st === "saved"
                  ? "Added to review"
                  : st === "error"
                    ? "Failed — retry"
                    : st === "saving"
                      ? "Adding…"
                      : "Add to review"}
              </button>
            </span>
          </span>
        );
      })}
    </span>
  );
}
