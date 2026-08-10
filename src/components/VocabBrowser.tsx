"use client";

import { useMemo, useState } from "react";
import type { VocabItem } from "@/lib/datasets";
import { speakJapanese } from "@/lib/tts";

export function VocabBrowser({ levels }: { levels: Record<string, VocabItem[]> }) {
  const [level, setLevel] = useState("N5");
  const [query, setQuery] = useState("");

  const items = useMemo(() => levels[level] ?? [], [levels, level]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (v) =>
        v.word.includes(q) ||
        v.reading.includes(q) ||
        v.meanings.some((m) => m.toLowerCase().includes(q)),
    );
  }, [items, query]);

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
          placeholder="Search word, meaning…"
          className="w-64 rounded-xl border border-line bg-panel px-4 py-2 text-sm outline-none placeholder:text-muted/60 focus:border-accent"
        />
        <span className="text-xs text-muted">{filtered.length.toLocaleString()} words</span>
      </div>

      <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-panel">
        {filtered.slice(0, 300).map((v) => (
          <div key={v.word} className="flex items-center gap-4 px-4 py-3">
            <button
              onClick={() => speakJapanese(v.word)}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-xs text-muted transition-colors hover:border-accent hover:text-accent"
              aria-label={`Speak ${v.word}`}
            >
              🔊
            </button>
            <div className="w-32 shrink-0">
              <div className="font-jp text-lg leading-tight">{v.word}</div>
              <div className="text-xs text-muted">{v.reading}</div>
            </div>
            <div className="min-w-0 flex-1 text-sm">{v.meanings.join("; ")}</div>
          </div>
        ))}
        {filtered.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted">No matches.</div>}
      </div>
    </div>
  );
}
