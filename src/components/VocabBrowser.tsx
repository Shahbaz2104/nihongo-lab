"use client";

import { useMemo, useState } from "react";
import type { VocabItem } from "@/lib/datasets";
import type { AnnotatedExample } from "@/lib/annotate";
import { speakJapanese } from "@/lib/tts";
import { Furigana } from "@/components/Furigana";
import { RubyText } from "@/components/RubyText";

interface Row extends Omit<VocabItem, "examples"> {
  examples: AnnotatedExample[];
}

export function VocabBrowser({ levels }: { levels: Record<string, Row[]> }) {
  const [level, setLevel] = useState("N5");
  const [query, setQuery] = useState("");

  const items = useMemo(() => levels[level] ?? [], [levels, level]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (v) =>
        v.word.includes(q) ||
        v.kanji?.includes(q) ||
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
        {filtered.slice(0, 300).map((v) => {
          const word = v.kanji ?? v.word;
          const phrase = v.examples[0];
          return (
            <div key={v.word} className="px-4 py-3">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => speakJapanese(v.reading || word)}
                  className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-line text-xs text-muted transition-colors hover:border-accent hover:text-accent"
                  aria-label={`Speak ${word}`}
                >
                  🔊
                </button>
                <div className="w-40 shrink-0">
                  <div className="font-jp text-lg leading-tight">
                    <Furigana word={word} reading={v.reading} />
                  </div>
                  <div className="text-xs text-muted">{v.reading}</div>
                </div>
                <div className="min-w-0 flex-1 text-sm">{v.meanings.join("; ")}</div>
              </div>
              {phrase && (
                <div className="ml-12 mt-2 flex items-start gap-2 rounded-xl bg-panel-2 px-3 py-2">
                  <button
                    onClick={() => speakJapanese(phrase.ja)}
                    className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded border border-line text-[10px] text-muted transition-colors hover:border-accent hover:text-accent"
                    aria-label={`Speak phrase`}
                  >
                    🔊
                  </button>
                  <div className="min-w-0">
                    <div className="font-jp text-sm">
                      <RubyText tokens={phrase.tokens} />
                    </div>
                    <div className="mt-0.5 text-[11px] text-muted italic">{phrase.romaji}</div>
                    <div className="mt-0.5 text-xs text-muted">{phrase.en}</div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="px-4 py-8 text-center text-sm text-muted">No matches.</div>}
      </div>
    </div>
  );
}
