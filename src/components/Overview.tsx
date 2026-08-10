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
        <StatCard label="Due today" value={stats ? String(stats.dueCards) : "…"} accent="text-accent" />
        <StatCard label="Total cards" value={stats ? String(stats.totalCards) : "…"} />
        <StatCard label="Reviewed today" value={stats ? String(stats.todayReviews) : "…"} />
        <StatCard
          label="Accuracy"
          value={stats?.todayAccuracy == null ? "–" : `${stats.todayAccuracy}%`}
        />
      </div>

      {stats && stats.dueCards > 0 && (
        <Link
          href="/review"
          className="flex items-center justify-between rounded-2xl bg-accent px-6 py-5 text-black transition-opacity hover:opacity-90"
        >
          <div>
            <div className="text-lg font-bold">{stats.dueCards} cards ready to review</div>
            <div className="text-sm opacity-80">Keep your streak alive →</div>
          </div>
          <div className="font-jp text-3xl">復習</div>
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

function StatCard({ label, value, accent }: { label: string; value: string; accent?: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4">
      <div className={`text-2xl font-bold ${accent ?? ""}`}>{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}
