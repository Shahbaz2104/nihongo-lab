interface Props {
  value: number;
  className?: string;
}

export function ProgressBar({ value, className }: Props) {
  const pct = Math.min(1, Math.max(0, value));
  return (
    <div className={`h-1.5 w-full overflow-hidden rounded-full bg-panel-2 ${className ?? ""}`}>
      <div
        className="h-full origin-left rounded-full bg-accent transition-transform duration-300 ease-out"
        style={{ transform: `scaleX(${pct})` }}
      />
    </div>
  );
}
