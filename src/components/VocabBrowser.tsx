"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { VocabItem } from "@/lib/datasets";
import type { AnnotatedExample } from "@/lib/annotate";
import { Furigana } from "@/components/Furigana";
import { RubyText } from "@/components/RubyText";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";
import { Button } from "@/components/ui/Button";

interface Row extends Omit<VocabItem, "examples"> {
  examples: AnnotatedExample[];
}

const PAGE_SIZE = 50;

export function VocabBrowser({ levels }: { levels: Record<string, Row[]> }) {
  const [level, setLevel] = useState("N5");
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState(PAGE_SIZE);

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

  const shown = filtered.slice(0, visible);
  return (
    <div className="space-y-5">
      <div className="sticky top-0 z-10 -mx-1 flex flex-wrap items-center gap-3 bg-[color:var(--background)] px-1 py-2">
        <SegmentedControl
          options={Object.keys(levels).map((l) => ({ id: l, label: l }))}
          value={level}
          onChange={(l) => {
            setLevel(l);
            setVisible(PAGE_SIZE);
          }}
        />
        <div className="relative">
          <MagnifyingGlass
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setVisible(PAGE_SIZE);
            }}
            placeholder="Search word, meaning…"
            className="w-64 rounded-xl border border-line bg-panel py-2 pl-8 pr-3 text-sm outline-none placeholder:text-muted/60 focus:border-accent"
          />
        </div>
        <span className="text-xs tabular-nums text-muted">
          {filtered.length.toLocaleString()} words
        </span>
      </div>

      {shown.length === 0 ? (
        <EmptyState
          icon={<MagnifyingGlass size={28} weight="duotone" />}
          title="No words match your search"
          body="Try a different spelling, reading, or meaning."
        />
      ) : (
        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-panel">
          {shown.map((v) => {
            const word = v.kanji ?? v.word;
            const phrase = v.examples[0];
            return (
              <div key={v.word} className="px-4 py-3 transition-colors hover:bg-panel-2/40">
                <div className="flex items-center gap-4">
                  <SpeakButton
                    text={v.reading || word}
                    size="sm"
                    label={`Listen to ${word}`}
                  />
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
                    <SpeakButton text={phrase.ja} size="sm" label="Listen to example" />
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
        </div>
      )}

      {visible < filtered.length && (
        <div className="flex justify-center">
          <Button variant="secondary" onClick={() => setVisible((v) => v + PAGE_SIZE)}>
            Show more ({Math.min(PAGE_SIZE, filtered.length - visible).toLocaleString()} more)
          </Button>
        </div>
      )}
    </div>
  );
}
