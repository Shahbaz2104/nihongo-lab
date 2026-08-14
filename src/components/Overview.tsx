"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import {
  ArrowRight,
  BookOpen,
  Books,
  Cards,
  ChartBar,
  ListDashes,
  PencilSimpleLine,
  TextAa,
  Trophy,
} from "@phosphor-icons/react";
import { api, type Stats } from "@/lib/api";
import { computeStreak } from "@/lib/dates";
import { Skeleton } from "@/components/ui/Skeleton";

const modules = [
  { href: "/review", label: "Review", desc: "Spaced-repetition flashcards", icon: Cards },
  { href: "/kana", label: "Kana", desc: "Hiragana & katakana charts and drills", icon: TextAa },
  { href: "/kanji", label: "Kanji", desc: "Stroke order and draw practice", icon: PencilSimpleLine },
  { href: "/vocab", label: "Vocab", desc: "8,000+ JLPT words", icon: Books },
  { href: "/stories", label: "Stories", desc: "Graded reading and conversation", icon: BookOpen, featured: true },
  { href: "/grammar", label: "Grammar", desc: "Patterns with examples", icon: ListDashes },
  { href: "/quiz", label: "Quiz", desc: "Multiple-choice tests", icon: Trophy },
  { href: "/stats", label: "Stats", desc: "Progress and activity", icon: ChartBar },
];

export function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
  }, []);

  const streak = stats ? computeStreak(stats.history) : null;

  return (
    <div className="space-y-8">
      <header>
        <div className="mb-1 text-xs uppercase tracking-widest text-muted">Nihongo Lab</div>
        <h1 className="text-3xl font-bold tracking-tight">日本語ラボ</h1>
        <p className="mt-2 max-w-xl text-muted">
          An all-in-one Japanese learning lab with kana drills, kanji stroke order,
          graded reading, and a spaced-repetition engine built from scratch.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats ? (
          <>
            <StatCard label="Due today" value={String(stats.dueCards)} accent="text-accent" bar="bg-accent" />
            <StatCard label="Total cards" value={String(stats.totalCards)} bar="bg-indigo" />
            <StatCard label="Reviewed today" value={String(stats.todayReviews)} bar="bg-gold" />
            <StatCard
              label="Accuracy"
              value={stats.todayAccuracy == null ? "–" : `${stats.todayAccuracy}%`}
              bar="bg-good"
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        )}
      </div>

      <Link
        href="/session"
        className="press group block rounded-2xl border border-accent/30 bg-gradient-to-br from-panel via-panel to-accent/10 p-6 transition-colors hover:border-accent"
      >
        <div className="flex items-center gap-2">
          <span className="font-jp text-xl font-bold">今日の日本語</span>
          <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
            Session
          </span>
        </div>
        <div className="mt-1 text-sm text-muted">Today’s Japanese — one guided daily flow.</div>
        <dl className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5">
          <PlanRow label="Reviews" value={stats ? String(stats.dueCards) : "…"} />
          <PlanRow label="New vocab" value={stats ? String(stats.newWords) : "…"} />
          <PlanRow label="Quiz" value="5" />
          <PlanRow label="Reading" value="1" />
          <PlanRow label="Conversation" value="1" />
        </dl>
        <div className="mt-5 flex items-center gap-2 text-sm font-semibold text-accent">
          Start today2019s session
          <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
        </div>
      </Link>

      {stats && stats.dueCards > 0 && (
        <Link
          href="/review"
          className="press group flex items-center justify-between rounded-2xl bg-gradient-to-r from-accent to-gold px-6 py-5 text-black shadow-lg shadow-accent/20"
        >
          <div>
            <div className="text-lg font-bold">{stats.dueCards} cards ready to review</div>
            <div className="mt-0.5 text-sm opacity-80">
              {streak && streak > 0 ? `${streak}-day streak — keep it alive` : "Start your streak today"}
            </div>
          </div>
          <ArrowRight size={22} weight="bold" className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {modules.map((m, i) => {
          const Icon = m.icon;
          if (m.featured) {
            return (
              <motion.div
                key={m.href}
                initial={reduce ? false : { opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
                className="sm:col-span-2"
              >
                <Link
                  href={m.href}
                  className="group flex items-center gap-4 rounded-2xl border border-accent/30 bg-gradient-to-br from-panel via-panel to-accent/10 p-5 transition-colors hover:border-accent"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl bg-accent-soft text-accent">
                    <Icon size={24} weight="duotone" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">{m.label}</span>
                      <span className="rounded-md bg-accent px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-black">
                        Reading
                      </span>
                    </div>
                    <div className="text-sm text-muted">
                      Word-by-word furigana, hover tooltips, and conversation practice.
                    </div>
                  </div>
                  <ArrowRight size={18} className="shrink-0 text-muted transition-all group-hover:translate-x-1 group-hover:text-accent" />
                </Link>
              </motion.div>
            );
          }
          return (
            <motion.div
              key={m.href}
              initial={reduce ? false : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: i * 0.05, ease: [0.16, 1, 0.3, 1] }}
            >
              <Link
                href={m.href}
                className="group block rounded-2xl border border-line bg-panel p-5 transition-colors hover:border-accent"
              >
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-xl bg-panel-2 text-accent transition-colors group-hover:bg-accent-soft">
                  <Icon size={20} weight="duotone" />
                </div>
                <div className="font-semibold">{m.label}</div>
                <div className="text-sm text-muted">{m.desc}</div>
              </Link>
            </motion.div>
          );
        })}
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

function PlanRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-panel-2/60 px-3 py-2">
      <dt className="text-[11px] text-muted">{label}</dt>
      <dd className="text-lg font-bold tabular-nums">{value}</dd>
    </div>
  );
}
