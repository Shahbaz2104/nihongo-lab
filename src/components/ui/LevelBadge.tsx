export function LevelBadge({ level, className }: { level: string; className?: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-soft px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-accent ${className ?? ""}`}
    >
      <span className="h-1 w-1 rounded-full bg-accent" />
      {level}級
    </span>
  );
}