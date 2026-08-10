"use client";

import { useEffect, useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { api, type Stats } from "@/lib/api";

export function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
  }, []);

  if (!stats) return <div className="py-20 text-center text-muted">Loading stats…</div>;

  const byLevel = stats.byLevel
    .filter((b) => b.level)
    .sort((a, b) => (a.level! < b.level! ? 1 : -1));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Stats</h1>
        <p className="mt-1 text-sm text-muted">Your review activity over the last 30 days.</p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <Card label="Due today" value={String(stats.dueCards)} />
        <Card label="Total cards" value={String(stats.totalCards)} />
        <Card label="Reviewed today" value={String(stats.todayReviews)} />
        <Card label="Accuracy today" value={stats.todayAccuracy == null ? "–" : `${stats.todayAccuracy}%`} />
      </div>

      <div className="rounded-2xl border border-line bg-panel p-5">
        <div className="mb-4 text-sm font-semibold">Last 30 days</div>
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={stats.history}>
            <CartesianGrid stroke="#232a3a" strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="date" tick={{ fill: "#8a93a6", fontSize: 10 }} tickFormatter={(d: string) => d.slice(5)} />
            <YAxis tick={{ fill: "#8a93a6", fontSize: 10 }} allowDecimals={false} width={30} />
            <Tooltip
              contentStyle={{ background: "#131722", border: "1px solid #232a3a", borderRadius: 12 }}
              labelStyle={{ color: "#e6e9ef" }}
            />
            <Legend />
            <Bar dataKey="reviews" name="Reviews" fill="#ff5c5c" radius={[3, 3, 0, 0]} />
            <Bar dataKey="learned" name="New learned" fill="#7c8cff" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="rounded-2xl border border-line bg-panel p-5">
        <div className="mb-4 text-sm font-semibold">Cards per JLPT level</div>
        <div className="grid gap-2 sm:grid-cols-5">
          {byLevel.map((b) => (
            <div key={b.level} className="rounded-xl border border-line bg-panel-2 p-4 text-center">
              <div className="text-xs text-muted">{b.level}</div>
              <div className="mt-1 text-xl font-bold">{b._count._all}</div>
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
      <div className="text-2xl font-bold">{value}</div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}
