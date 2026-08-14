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

export function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    api
      .stats()
      .then(setStats)
      .catch(() => setFailed(true));
  }, []);

  if (!stats && !failed) {
    return (
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
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
        <p className="mt-1 text-sm text-muted">Your review activity over the last 30 days.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card label="Due today" value={String(stats.dueCards)} />
        <Card label="Total cards" value={String(stats.totalCards)} />
        <Card label="Reviewed today" value={String(stats.todayReviews)} />
        <Card
          label="Accuracy today"
          value={stats.todayAccuracy == null ? "–" : `${stats.todayAccuracy}%`}
        />
      </div>

      {streak > 0 && (
        <div className="flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/5 px-5 py-4">
          <Flame size={26} weight="fill" className="text-gold" />
          <div>
            <div className="text-sm font-semibold">
              {streak}-day streak
            </div>
            <div className="text-xs text-muted">
              Keep reviewing daily to extend it.
            </div>
          </div>
        </div>
      )}

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
              cursor={{ fill: "rgba(255,106,92,0.06)" }}
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
        <div className="mb-4 text-sm font-semibold">Cards per JLPT level</div>
        <div className="grid gap-2 sm:grid-cols-5">
          {byLevel.map((b) => (
            <div key={b.level} className="rounded-xl border border-line bg-panel-2 p-4 text-center">
              <div className="text-xs text-muted">{b.level}</div>
              <div className="mt-1 text-xl font-bold tabular-nums">{b._count._all}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function Card({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-line bg-panel p-4">
      <div className="text-2xl font-bold tabular-nums">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}
