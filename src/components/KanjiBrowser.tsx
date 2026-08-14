"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CaretLeft, CaretRight, MagnifyingGlass, X } from "@phosphor-icons/react";
import type { KanjiItem } from "@/lib/datasets";
import { speakJapanese } from "@/lib/tts";
import { StrokeOrder } from "@/components/StrokeOrder";
import { KanjiDraw } from "@/components/KanjiDraw";
import { Modal } from "@/components/ui/Modal";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";

export function KanjiBrowser({ levels }: { levels: Record<string, KanjiItem[]> }) {
  const [selected, setSelected] = useState<KanjiItem | null>(null);
  const [level, setLevel] = useState("N5");
  const [query, setQuery] = useState("");

  const levelItems = useMemo(() => levels[level] ?? [], [levels, level]);
  const filtered = useMemo(() => {
    const q = query.trim();
    if (!q) return levelItems;
    return levelItems.filter(
      (k) =>
        k.character.includes(q) ||
        k.meanings.some((m) => m.toLowerCase().includes(q.toLowerCase())) ||
        k.onyomi.some((o) => o.toLowerCase().includes(q.toLowerCase())) ||
        k.kunyomi.some((o) => o.toLowerCase().includes(q.toLowerCase())),
    );
  }, [levelItems, query]);

  const selectedIdx = selected ? filtered.indexOf(selected) : -1;

  const step = useCallback(
    (dir: 1 | -1) => {
      setSelected((cur) => {
        if (!cur) return cur;
        const idx = filtered.indexOf(cur);
        const next = filtered[idx + dir];
        return next ?? cur;
      });
    },
    [filtered],
  );

  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") {
        e.preventDefault();
        step(1);
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        step(-1);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [selected, step]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          options={Object.keys(levels).map((l) => ({ id: l, label: l }))}
          value={level}
          onChange={(l) => {
            setLevel(l);
            setSelected(null);
          }}
        />
        <div className="relative">
          <MagnifyingGlass
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search kanji, meaning, reading…"
            className="w-64 rounded-xl border border-line bg-panel py-2 pl-8 pr-3 text-sm outline-none placeholder:text-muted/60 focus:border-accent"
          />
        </div>
        <span className="text-xs tabular-nums text-muted">{filtered.length.toLocaleString()} kanji</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MagnifyingGlass size={28} weight="duotone" />}
          title="No kanji match your search"
          body="Try a different reading, meaning, or the kanji itself."
        />
      ) : (
        <div className="grid grid-cols-6 gap-2 sm:grid-cols-8 md:grid-cols-10">
          {filtered.map((k) => (
            <button
              key={k.character}
              onClick={() => setSelected(k)}
              className="group flex flex-col items-center rounded-xl border border-line bg-panel py-3 transition-colors hover:border-accent"
            >
              <span className="font-jp text-3xl text-foreground group-hover:text-accent">{k.character}</span>
              <span className="mt-1 max-w-full truncate px-1 text-[10px] text-muted">
                {k.meanings[0]}
              </span>
            </button>
          ))}
        </div>
      )}

      <Modal
        open={selected !== null}
        onClose={() => setSelected(null)}
        ariaLabel={`Details for ${selected?.character ?? ""}`}
        className="max-w-2xl"
      >
        {selected && (
          <div className="p-6">
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => speakJapanese(selected.character)}
                  className="font-jp text-6xl text-accent transition-transform hover:scale-105"
                  aria-label={`Listen to ${selected.character}`}
                  title="Listen"
                >
                  {selected.character}
                </button>
                <div>
                  <div className="text-sm text-muted">
                    {selected.level} · {selected.strokes} strokes · grade {selected.grade}
                  </div>
                  <div className="mt-1 text-lg font-semibold">{selected.meanings.join(", ")}</div>
                </div>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="press grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-line text-muted transition-colors hover:text-foreground"
                aria-label="Close"
              >
                <X size={14} />
              </button>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-panel-2 p-4">
                <div className="mb-2 text-xs uppercase tracking-widest text-muted">Stroke order</div>
                <div className="grid place-items-center">
                  <StrokeOrder key={selected.character} character={selected.character} />
                </div>
              </div>
              <div className="rounded-xl border border-line bg-panel-2 p-4">
                <div className="mb-2 text-xs uppercase tracking-widest text-muted">Practice drawing</div>
                <div className="grid place-items-center">
                  <KanjiDraw key={selected.character} character={selected.character} />
                </div>
              </div>
            </div>

            <div className="mt-4 grid gap-2 text-sm sm:grid-cols-2">
              <div className="rounded-xl border border-line bg-panel-2 p-4">
                <div className="text-xs uppercase tracking-widest text-muted">On&apos;yomi (音)</div>
                <div className="mt-1 font-jp text-lg">
                  {selected.onyomi.length ? selected.onyomi.join("、") : "—"}
                </div>
              </div>
              <div className="rounded-xl border border-line bg-panel-2 p-4">
                <div className="text-xs uppercase tracking-widest text-muted">Kun&apos;yomi (訓)</div>
                <div className="mt-1 font-jp text-lg">
                  {selected.kunyomi.length ? selected.kunyomi.join("、") : "—"}
                </div>
              </div>
            </div>

            <div className="mt-5 flex items-center justify-between border-t border-line pt-4">
              <button
                onClick={() => step(-1)}
                disabled={selectedIdx <= 0}
                className="press flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                <CaretLeft size={14} />
                Previous
              </button>
              <span className="text-xs tabular-nums text-muted">
                {selectedIdx + 1} / {filtered.length}
              </span>
              <button
                onClick={() => step(1)}
                disabled={selectedIdx < 0 || selectedIdx >= filtered.length - 1}
                className="press flex h-9 items-center gap-1.5 rounded-xl px-3 text-xs font-medium text-muted transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next
                <CaretRight size={14} />
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
