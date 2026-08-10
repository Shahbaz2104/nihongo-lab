"use client";

import { useMemo, useState } from "react";
import type { GrammarItem } from "@/lib/datasets";
import { speakJapanese } from "@/lib/tts";

export function GrammarBrowser({ levels }: { levels: Record<string, GrammarItem[]> }) {
  const [level, setLevel] = useState("N5");

  const items = useMemo(() => levels[level] ?? [], [levels, level]);

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
        <span className="text-xs text-muted">{items.length} grammar points</span>
      </div>

      <div className="space-y-3">
        {items.map((g) => (
          <div key={g.pattern} className="rounded-2xl border border-line bg-panel p-5">
            <div className="flex flex-wrap items-center gap-3">
              <span className="font-jp text-xl font-bold text-accent">{g.pattern}</span>
              <span className="text-sm text-foreground/90">{g.meaning}</span>
            </div>
            {g.formation && <div className="mt-2 text-xs text-muted">{g.formation}</div>}
            {g.examples.length > 0 && (
              <div className="mt-3 rounded-xl bg-panel-2 p-4">
                {g.examples.slice(0, 2).map((ex, i) => (
                  <div key={i} className="flex items-start gap-2 py-1">
                    <button
                      onClick={() => speakJapanese(ex.ja)}
                      className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded border border-line text-[10px] text-muted transition-colors hover:border-accent hover:text-accent"
                    >
                      🔊
                    </button>
                    <div>
                      <div className="font-jp">{ex.ja}</div>
                      <div className="text-xs text-muted">{ex.en}</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
