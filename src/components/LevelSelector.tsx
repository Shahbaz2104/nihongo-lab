"use client";

import { JLPT_LEVELS } from "@/lib/levels";

interface Props {
  value: string;
  onChange: (v: string) => void;
}

export function LevelSelector({ value, onChange }: Props) {
  return (
    <div className="flex gap-1 rounded-xl border border-line bg-panel p-1">
      {JLPT_LEVELS.map((l) => (
        <button
          key={l}
          onClick={() => onChange(l)}
          className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            value === l ? "bg-accent text-black" : "text-muted hover:text-foreground"
          }`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
