export function EnsoMark({ size = 36, className }: { size?: number; className?: string }) {
  return (
    <div
      className={`relative grid shrink-0 place-items-center text-accent ${className ?? ""}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <div
        className="absolute inset-0 rounded-full"
        style={{
          background:
            "conic-gradient(from 210deg, transparent 0deg, transparent 44deg, currentColor 44deg, currentColor 300deg, transparent 300deg)",
          WebkitMask:
            "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))",
          mask: "radial-gradient(farthest-side, transparent calc(100% - 2.5px), #000 calc(100% - 2.5px))",
        }}
      />
      <span className="font-display font-bold leading-none" style={{ fontSize: size * 0.42 }}>
        語
      </span>
    </div>
  );
}