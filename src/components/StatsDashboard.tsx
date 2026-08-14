"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { ChartBar, Flame } from "@phosphor-icons/react";
import { api, type Stats } from "@/lib/api";
import { computeStreak } from "@/lib/dates";
import { EmptyState } from "@/components/ui/EmptyState";
import { Skeleton } from "@/components/ui/Skeleton";

const STORY_KEY = "nl-story-progress:";

export function StatsDashboard({ stories }: { stories: { id: string; sentences: number }[] }) {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);
  const [storiesCompleted] = useState<number | null>(() => {
    try {
      if (typeof window === "undefined") return null;
      const total = new Map(stories.map((s) => [s.id, s.sentences]));
      let completed = 0;
      for (let i = 0; i < window.localStorage.length; i++) {
        const key = window.localStorage.key(i);
        if (!key || !key.startsWith(STORY_KEY)) continue;
        const id = key.slice(STORY_KEY.length);
        const n = Number(window.localStorage.getItem(key));
        const sentences = total.get(id);
        if (sentences !== undefined && Number.isFinite(n) && n >= sentences - 1) completed++;
      }
      return completed;
    } catch {
      return 0;
    }
  });

  useEffect(() => {
    api
      .stats()
      .then(setStats)
      .catch(() => setFailed(true));
  }, []);

  if (!stats && !failed) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-24" />
        ))}
        <Skeleton className="h-64 md:col-span-4" />
      </div>
    );
  }

  if (failed) {
    return (
      <EmptyState
        icon={<ChartBar size={28} weight="duotone" />}
        title="Couldn't load stats"
        body="Check that the database is available, then try again."
      />
    );
  }

  if (!stats) return null;

  if (stats.totalCards === 0) {
    return (
      <EmptyState
        icon={<ChartBar size={28} weight="duotone" />}
        title="No reviews yet"
        body="Head to Review to start learning. Your progress will show up here once you review your first cards."
      />
    );
  }

  const byLevel = stats.byLevel
    .filter((b) => b.level)
    .sort((a, b) => (a.level! < b.level! ? 1 : -1));

  const streak = computeStreak(stats.history);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">Stats</h1>
        <p className="mt-1 text-sm text-muted">Your review activity — from real database data.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card label="Today's reviews" value={String(stats.todayReviews)} />
        <Card
          label="Today's accuracy"
          value={stats.todayAccuracy == null ? "–" : `${stats.todayAccuracy}%`}
        />
        <Card label="Current streak" value={streak > 0 ? `${streak}d` : "–"} accent={streak > 0} />
        <Card label="Cards due" value={String(stats.dueCards)} />
      </div>

      {streak > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/5 px-5 py-4">
          <Flame size={26} weight="fill" className="text-gold" />
          <div>
            <div className="text-sm font-semibold">{streak}-day streak</div>
            <div className="text-xs text-muted">Keep reviewing daily to extend it.</div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
        <Card label="Cards learned" value={String(stats.cardsLearned)} />
        <Card label="Words learned" value={String(stats.learnedByType.vocab)} />
        <Card label="Kanji learned" value={String(stats.learnedByType.kanji)} />
        <Card label="Grammar learned" value={String(stats.learnedByType.grammar)} />
        <Card label="Total reviews" value={String(stats.totalReviews)} />
        <Card label="Stories completed" value={String(storiesCompleted ?? "–")} />
      </div>

      <div className="rounded-2xl border border-line bg-panel p-5">
        <div className="mb-4 text-sm font-semibold">Last 30 days</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats.history}>
            <CartesianGrid stroke="var(--color-line)" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fill: "var(--color-muted)", fontSize: 10 }}
              tickFormatter={(d: string) => d.slice(5)}
            />
            <YAxis tick={{ fill: "var(--color-muted)", fontSize: 10 }} allowDecimals={false} width={30} />
            <Tooltip
              cursor={{ fill: "rgba(216,72,44,0.08)" }}
              contentStyle={{
                background: "var(--color-elevated)",
                border: "1px solid var(--color-line)",
                borderRadius: 12,
                color: "var(--color-foreground)",
              }}
              labelStyle={{ color: "var(--color-muted)" }}
            />
            <Bar dataKey="reviews" name="Reviews" fill="var(--color-accent)" radius={[3, 3, 0, 0]} />
            <Bar dataKey="learned" name="New learned" fill="var(--color-indigo)" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-line bg-panel p-5">
        <div className="mb-1 text-sm font-semibold">Progress by JLPT level</div>
        <p className="mb-4 text-xs text-muted">
          Share of each level&rsquo;s curriculum you&rsquo;ve learned (reviewed at least once) — vocab + kanji + grammar.
        </p>
        <div className="grid gap-4">
          {stats.levelProgress.map((p) => (
            <div key={p.level} className="flex items-center gap-3">
              <div className="w-8 shrink-0 text-sm font-bold text-muted">{p.level}</div>
              <div className="h-3 flex-1 overflow-hidden rounded-full bg-panel-2">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-accent to-gold transition-all"
                  style={{ width: `${p.pct}%` }}
                />
              </div>
              <div className="w-24 shrink-0 text-right text-xs tabular-nums text-muted">
                {p.pct}% · {p.learned}/{p.total}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-5 grid gap-2 sm:grid-cols-5">
          {byLevel.map((b) => (
            <div key={b.level} className="rounded-xl border border-line bg-panel-2 p-4 text-center">
              <div className="text-xs text-muted">{b.level} cards</div>
              <div className="mt-1 text-xl font-bold tabular-nums">{b._count._all}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value, accent = false }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4">
      <div className={`text-2xl font-bold tabular-nums ${accent ? "text-gold" : ""}`}>{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}