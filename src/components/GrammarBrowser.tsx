"use client";

import { useMemo, useState } from "react";
import { MagnifyingGlass } from "@phosphor-icons/react";
import type { GrammarItem } from "@/lib/datasets";
import type { AnnotatedExample } from "@/lib/annotate";
import { RubyText } from "@/components/RubyText";
import { SpeakButton } from "@/components/ui/SpeakButton";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { EmptyState } from "@/components/ui/EmptyState";

interface Row extends Omit<GrammarItem, "examples"> {
  examples: AnnotatedExample[];
}

export function GrammarBrowser({ levels }: { levels: Record<string, Row[]> }) {
  const [level, setLevel] = useState("N5");
  const [query, setQuery] = useState("");

  const items = useMemo(() => levels[level] ?? [], [levels, level]);
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (g) =>
        g.pattern.toLowerCase().includes(q) ||
        g.meaning.toLowerCase().includes(q) ||
        g.formation.toLowerCase().includes(q),
    );
  }, [items, query]);

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <SegmentedControl
          options={Object.keys(levels).map((l) => ({ id: l, label: l }))}
          value={level}
          onChange={setLevel}
        />
        <div className="relative">
          <MagnifyingGlass
            size={14}
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search pattern, meaning, formation…"
            className="w-64 rounded-xl border border-line bg-panel py-2 pl-8 pr-3 text-sm outline-none placeholder:text-muted/60 focus:border-accent"
          />
        </div>
        <span className="text-xs tabular-nums text-muted">{filtered.length} grammar points</span>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<MagnifyingGlass size={28} weight="duotone" />}
          title="No grammar points match your search"
          body="Try a different pattern or meaning."
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((g) => (
            <div key={g.pattern} className="rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-accent/40">
              <div className="flex flex-wrap items-center gap-3">
                <span className="font-jp text-xl font-bold text-accent">{g.pattern}</span>
                <span className="text-sm text-foreground/90">{g.meaning}</span>
              </div>
              {g.formation && <div className="mt-2 text-xs text-muted">{g.formation}</div>}
              {g.examples.length > 0 && (
                <div className="mt-3 space-y-2 rounded-xl bg-panel-2 p-4">
                  {g.examples.slice(0, 2).map((ex, i) => (
                    <div key={i} className="flex items-start gap-2 py-1">
                      <SpeakButton text={ex.ja} size="sm" label="Listen to example" />
                      <div className="min-w-0">
                        <div className="font-jp text-base">
                          <RubyText tokens={ex.tokens} />
                        </div>
                        <div className="mt-0.5 text-xs text-muted italic">{ex.romaji}</div>
                        <div className="mt-0.5 text-xs text-muted">{ex.en}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
