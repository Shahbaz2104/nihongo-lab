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
    <div className={`flex gap-1 rounded-xl border border-line bg-panel p-1 ${className ?? ""}`}>
      {options.map((o) => (
        <button
          key={o.id}
          onClick={() => onChange(o.id)}
          className={`press rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
            value === o.id ? "bg-accent text-black" : "text-muted hover:text-foreground"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
