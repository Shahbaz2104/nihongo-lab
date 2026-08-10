"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

function toCode(character: string) {
  return character.codePointAt(0)!.toString(16).padStart(5, "0");
}

export function StrokeOrder({ character }: { character: string }) {
  const [paths, setPaths] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let alive = true;
    fetch(`https://raw.githubusercontent.com/KanjiVG/kanjivg/master/kanji/${toCode(character)}.svg`)
      .then((r) => {
        if (!r.ok) throw new Error("not found");
        return r.text();
      })
      .then((svgText) => {
        const doc = new DOMParser().parseFromString(svgText, "image/svg+xml");
        const found = Array.from(doc.querySelectorAll("path")).map((p) =>
          p.getAttribute("d"),
        ) as string[];
        if (alive) {
          setPaths(found);
          setLoading(false);
        }
      })
      .catch(() => {
        if (alive) {
          setError(true);
          setLoading(false);
        }
      });
    return () => {
      alive = false;
    };
  }, [character]);

  const viewBox = useMemo(() => "0 0 109 109", []);

  if (loading) return <div className="py-10 text-center text-sm text-muted">Loading stroke data…</div>;
  if (error) return <div className="py-10 text-center text-sm text-muted">No stroke data available.</div>;

  return (
    <svg viewBox={viewBox} className="h-40 w-40" role="img" aria-label={`Stroke order for ${character}`}>
      {paths.map((d, i) => (
        <motion.path
          key={i}
          d={d}
          fill="none"
          strokeWidth={4.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          stroke={i % 2 === 0 ? "#e6e9ef" : "#ff5c5c"}
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 1 }}
          transition={{ delay: i * 0.55, duration: 0.5, ease: "easeInOut" }}
        />
      ))}
    </svg>
  );
}
