"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { api, type Stats } from "@/lib/api";

const modules = [
  { href: "/review", label: "Review", desc: "Spaced-repetition flashcards", emoji: "🔁" },
  { href: "/kana", label: "Kana", desc: "Hiragana & katakana", emoji: "あ" },
  { href: "/kanji", label: "Kanji", desc: "Stroke order & meanings", emoji: "漢" },
  { href: "/vocab", label: "Vocab", desc: "JLPT N5–N1 vocabulary", emoji: "単" },
  { href: "/grammar", label: "Grammar", desc: "Patterns with examples", emoji: "文" },
  { href: "/quiz", label: "Quiz", desc: "Test yourself", emoji: "✍️" },
];

export function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
  }, []);

  return (
    <div className="space-y-8">
      <header>
        <div className="mb-1 text-xs uppercase tracking-widest text-muted">Nihongo Lab</div>
        <h1 className="text-3xl font-bold">日本語ラボ</h1>
        <p className="mt-2 text-muted">
          An all-in-one Japanese learning lab with a spaced-repetition engine built from scratch.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatCard label="Due today" value={stats ? String(stats.dueCards) : "…"} accent="text-accent" bar="bg-accent" />
        <StatCard label="Total cards" value={stats ? String(stats.totalCards) : "…"} bar="bg-indigo" />
        <StatCard label="Reviewed today" value={stats ? String(stats.todayReviews) : "…"} bar="bg-gold" />
        <StatCard
          label="Accuracy"
          value={stats?.todayAccuracy == null ? "–" : `${stats.todayAccuracy}%`}
          bar="bg-good"
        />
      </div>

      {stats && stats.dueCards > 0 && (
        <Link
          href="/review"
          className="group flex items-center justify-between rounded-2xl bg-gradient-to-r from-accent via-[#ff4a5a] to-gold px-6 py-5 text-black shadow-lg shadow-accent/25 transition-transform hover:scale-[1.01]"
        >
          <div>
            <div className="text-lg font-bold">{stats.dueCards} cards ready to review</div>
            <div className="text-sm opacity-80">Keep your streak alive →</div>
          </div>
          <div className="font-jp text-3xl transition-transform group-hover:-rotate-6">復習</div>
        </Link>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {modules.map((m) => (
          <Link
            key={m.href}
            href={m.href}
            className="group rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-accent"
          >
            <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-panel-2 font-jp text-xl text-accent">
              {m.emoji}
            </div>
            <div className="font-semibold">{m.label}</div>
            <div className="text-sm text-muted">{m.desc}</div>
          </Link>
        ))}
      </div>
    </div>
  );
}

function StatCard({ label, value, accent, bar }: { label: string; value: string; accent?: string; bar?: string }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-panel p-4">
      <div className={`absolute inset-x-0 top-0 h-0.5 ${bar ?? "bg-line"}`} />
      <div className={`text-2xl font-bold tabular-nums ${accent ?? ""}`}>{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}
