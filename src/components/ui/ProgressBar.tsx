interface Props {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: Props) {
  const pct = Math.min(1, Math.max(0, value));
  return (
    <div className={`h-2 w-full overflow-hidden rounded-full bg-panel-2 ${className ?? ""}`}>
      <div
        className="h-full origin-left rounded-full bg-gradient-to-r from-accent via-accent to-gold shadow-[0_1px_2px_rgba(216,72,44,0.35)] transition-transform duration-300 ease-out"
        style={{ transform: `scaleX(${pct})` }}
      />
    </div>
  );
}