import type { ReactNode } from "react";

export interface SegmentedOption {
  id: string;
  label: ReactNode;
}

interface Props {
  options: SegmentedOption[];
  value: string;
  onChange: (id: string) => void;
  className?: string;
}

export function SegmentedControl({ options, value, onChange, className }: Props) {
  return (
    <div className={`flex gap-1 rounded-2xl border border-line bg-panel p-1 shadow-warm ${className ?? ""}`}>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`press h-10 flex-1 rounded-xl px-3 text-sm font-semibold transition-colors ${
            value === o.id
              ? "bg-accent text-white shadow-warm"
              : "text-muted hover:bg-panel-2 hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}