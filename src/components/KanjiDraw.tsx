"use client";

import { useRef, useState } from "react";

interface Props {
  character: string;
  size?: number;
}

export function KanjiDraw({ character, size = 200 }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const [opacity, setOpacity] = useState(0.25);

  const pos = (e: React.PointerEvent) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    return { x: ((e.clientX - rect.left) / rect.width) * size, y: ((e.clientY - rect.top) / rect.height) * size };
  };

  const start = (e: React.PointerEvent) => {
    drawing.current = true;
    const canvas = canvasRef.current!;
    const ctx = canvas.getContext("2d")!;
    const p = pos(e);
    ctx.beginPath();
    ctx.moveTo(p.x, p.y);
  };

  const move = (e: React.PointerEvent) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current!.getContext("2d")!;
    const p = pos(e);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = "#e6e9ef";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
  };

  const stop = () => {
    drawing.current = false;
  };

  const clear = () => {
    const ctx = canvasRef.current!.getContext("2d")!;
    ctx.clearRect(0, 0, size, size);
  };

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <canvas
          ref={canvasRef}
          width={size}
          height={size}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={stop}
          onPointerLeave={stop}
          className="cursor-crosshair touch-none rounded-xl border border-line bg-panel-2"
        />
        <div
          className="pointer-events-none absolute inset-0 grid place-items-center font-jp text-6xl"
          style={{ opacity, color: "#e6e9ef" }}
          aria-hidden
        >
          {character}
        </div>
      </div>
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-muted">
          <input
            type="range"
            min={0}
            max={0.5}
            step={0.05}
            value={opacity}
            onChange={(e) => setOpacity(Number(e.target.value))}
            className="accent-[#ff5c5c]"
          />
          guide
        </label>
        <button
          onClick={clear}
          className="rounded-lg border border-line px-4 py-1.5 text-xs font-semibold text-muted transition-colors hover:text-foreground"
        >
          Clear
        </button>
      </div>
    </div>
  );
}
