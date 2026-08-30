"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowCounterClockwise,
  CaretLeft,
  CaretRight,
  Pause,
  Play,
} from "@phosphor-icons/react";
import { IconButton } from "@/components/ui/IconButton";
import { Skeleton } from "@/components/ui/Skeleton";

function toCode(character: string) {
  return character.codePointAt(0)!.toString(16).padStart(5, "0");
}

const pathsCache = new Map<string, string[]>();

export function StrokeOrder({ character }: { character: string }) {
  const [paths, setPaths] = useState<string[]>(() => pathsCache.get(character) ?? []);
  const [loading, setLoading] = useState(() => !pathsCache.has(character));
  const [error, setError] = useState(false);
  const [progress, setProgress] = useState(0);
  const [playing, setPlaying] = useState(false);
  const reduce = useReducedMotion();

  useEffect(() => {
    if (pathsCache.has(character)) return;

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 10000);

    fetch(`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${toCode(character)}.svg`, {
      signal: controller.signal,
    })
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.text();
      })
      .then((svgText) => {
        const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
        const found = Array.from(doc.querySelectorAll("path")).map((p) =>
          p.getAttribute("d"),
        ) as string[];
        pathsCache.set(character, found);
        setPaths(found);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      })
      .finally(() => window.clearTimeout(timeout));

    return () => {
      controller.abort();
      window.clearTimeout(timeout);
    };
  }, [character]);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(
      () => setProgress((p) => Math.min(paths.length, p + 1)),
      550,
    );
    return () => window.clearInterval(id);
  }, [playing, paths.length]);

  const shown = reduce ? paths.length : progress;
  const done = progress >= paths.length;
  const viewBox = useMemo(() => "0 0 109 109", []);

  if (loading) return <Skeleton className="h-40 w-40" />;
  if (error) return <div className="py-10 text-center text-sm text-muted">No stroke data available.</div>;

  const togglePlay = () => {
    if (done) {
      setProgress(0);
      setPlaying(true);
    } else {
      setPlaying((p) => !p);
    }
  };
  return (
    <div className="flex flex-col items-center gap-3">
      <svg viewBox={viewBox} className="h-40 w-40" role="img" aria-label={`Stroke order for ${character}`}>
        {paths.slice(0, shown).map((d, i) => (
          <motion.path
            key={`${character}-${i}`}
            d={d}
            fill="none"
            strokeWidth={4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
            stroke={i % 2 === 0 ? "var(--line)" : "var(--accent)"}
            initial={reduce ? false : { pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 1 }}
            transition={{ duration: 0.4, ease: "easeInOut" }}
          />
        ))}
      </svg>
      {!reduce && (
        <div className="flex items-center gap-1.5">
          <IconButton size="sm" onClick={() => { setPlaying(false); setProgress(0); }} aria-label="Reset strokes" title="Reset">
            <ArrowCounterClockwise size={13} weight="bold" />
          </IconButton>
          <IconButton size="sm" onClick={() => { setPlaying(false); setProgress((p) => Math.max(0, p - 1)); }} aria-label="Previous stroke" title="Previous stroke">
            <CaretLeft size={13} weight="bold" />
          </IconButton>
          <IconButton size="sm" onClick={togglePlay} aria-label={playing && !done ? "Pause" : "Play"} title={playing && !done ? "Pause" : "Play"}>
            {playing && !done ? (
              <Pause size={13} weight="bold" />
            ) : (
              <Play size={13} weight="fill" className="ml-0.5" />
            )}
          </IconButton>
          <IconButton size="sm" onClick={() => { setPlaying(false); setProgress((p) => Math.min(paths.length, p + 1)); }} aria-label="Next stroke" title="Next stroke">
            <CaretRight size={13} weight="bold" />
          </IconButton>
        </div>
      )}
      {!reduce && (
        <div className="text-[11px] tabular-nums text-muted">
          {progress} / {paths.length} strokes
        </div>
      )}
    </div>
  );
}
