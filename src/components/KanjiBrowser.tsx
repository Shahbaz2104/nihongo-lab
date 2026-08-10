"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { KanjiItem } from "@/lib/datasets";
import { speakJapanese } from "@/lib/tts";
import { StrokeOrder } from "@/components/StrokeOrder";
import { KanjiDraw } from "@/components/KanjiDraw";

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

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 rounded-xl border border-line bg-panel p-1">
          {Object.keys(levels).map((l) => (
            <button
              key={l}
              onClick={() => setLevel(l)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                level === l ? "bg-accent text-black" : "text-muted hover:text-foreground"
              }`}
            >
              {l}
            </button>
          ))}
        </div>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search kanji, meaning, reading…"
          className="w-64 rounded-xl border border-line bg-panel px-4 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent"
        />
      </div>

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

      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-line bg-panel p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => speakJapanese(selected.character)}
                    className="font-jp text-6xl text-accent transition-transform hover:scale-105"
                  >
                    {selected.character}
                  </button>
                  <div>
                    <div className="text-sm text-muted">{selected.level} · {selected.strokes} strokes · grade {selected.grade}</div>
                    <div className="mt-1 text-lg font-semibold">{selected.meanings.join(", ")}</div>
                  </div>
                </div>
                <button
                  onClick={() => setSelected(null)}
                  className="grid h-8 w-8 place-items-center rounded-lg border border-line text-muted hover:text-foreground"
                >
                  ✕
                </button>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-xl border border-line bg-panel-2 p-4">
                  <div className="mb-2 text-xs uppercase tracking-widest text-muted">Stroke order</div>
                  <div className="grid place-items-center">
                    <StrokeOrder character={selected.character} />
                  </div>
                </div>
                <div className="rounded-xl border border-line bg-panel-2 p-4">
                  <div className="mb-2 text-xs uppercase tracking-widest text-muted">Practice drawing</div>
                  <div className="grid place-items-center">
                    <KanjiDraw character={selected.character} />
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
