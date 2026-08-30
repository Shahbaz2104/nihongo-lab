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
  Ear,
  ListDashes,
  PencilSimpleLine,
  TextAa,
  Trophy,
} from "@phosphor-icons/react";
import { api, type Stats } from "@/lib/api";
import { computeStreak } from "@/lib/dates";
import { Skeleton } from "@/components/ui/Skeleton";
import { CountUp } from "@/components/ui/CountUp";
import { EnsoRing } from "@/components/ui/EnsoRing";
import { LevelBadge } from "@/components/ui/LevelBadge";
import { SpeakButton } from "@/components/ui/SpeakButton";

const modules = [
  { href: "/review", label: "Review", desc: "Spaced-repetition flashcards", icon: Cards },
  { href: "/kana", label: "Kana", desc: "Hiragana & katakana charts and drills", icon: TextAa },
  { href: "/kanji", label: "Kanji", desc: "Stroke order and draw practice", icon: PencilSimpleLine },
  { href: "/vocab", label: "Vocab", desc: "8,000+ JLPT words", icon: Books },
  { href: "/stories", label: "Stories", desc: "Graded reading and conversation", icon: BookOpen, featured: true },
  { href: "/grammar", label: "Grammar", desc: "Patterns with examples", icon: ListDashes },
  { href: "/quiz", label: "Quiz", desc: "Multiple-choice tests", icon: Trophy },
  { href: "/listening", label: "Listening", desc: "Hear and identify sentences", icon: Ear },
  { href: "/stats", label: "Stats", desc: "Progress and activity", icon: ChartBar },
];

const WORD_OF_DAY = [
  { word: "勉強", reading: "べんきょう", meaning: "to study", level: "N5" },
  { word: "桜", reading: "さくら", meaning: "cherry blossom", level: "N4" },
  { word: "夢", reading: "ゆめ", meaning: "dream", level: "N5" },
  { word: "風", reading: "かぜ", meaning: "wind", level: "N5" },
  { word: "月", reading: "つき", meaning: "moon", level: "N5" },
  { word: "言葉", reading: "ことば", meaning: "word, language", level: "N4" },
  { word: "光", reading: "ひかり", meaning: "light", level: "N4" },
  { word: "道", reading: "みち", meaning: "road, way", level: "N5" },
  { word: "静か", reading: "しずか", meaning: "quiet", level: "N5" },
  { word: "温かい", reading: "あたたかい", meaning: "warm", level: "N5" },
  { word: "旅", reading: "たび", meaning: "journey", level: "N4" },
  { word: "空", reading: "そら", meaning: "sky", level: "N5" },
  { word: "海", reading: "うみ", meaning: "sea", level: "N5" },
  { word: "書く", reading: "かく", meaning: "to write", level: "N5" },
  { word: "読む", reading: "よむ", meaning: "to read", level: "N5" },
  { word: "考える", reading: "かんがえる", meaning: "to think", level: "N4" },
];

function wordOfDay(): (typeof WORD_OF_DAY)[number] {
  const start = new Date(new Date().getFullYear(), 0, 0);
  const day = Math.floor((Date.now() - start.getTime()) / 86400000);
  return WORD_OF_DAY[day % WORD_OF_DAY.length];
}

export function Overview() {
  const [stats, setStats] = useState<Stats | null>(null);
  const reduce = useReducedMotion();

  useEffect(() => {
    api.stats().then(setStats).catch(() => {});
  }, []);

  const streak = stats ? computeStreak(stats.history) : null;
  const wod = wordOfDay();
  const goal = stats ? Math.min(1, stats.todayReviews / Math.max(1, stats.dueCards)) : 0;

  return (
    <div className="space-y-6">
      <header>
        <div className="mb-1 text-xs uppercase tracking-widest text-muted">Nihongo Lab</div>
        <h1 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          日本語ラボ
        </h1>
        <p className="mt-2 max-w-xl text-sm text-muted">
          An all-in-one Japanese learning lab with kana drills, kanji stroke order,
          graded reading, and a spaced-repetition engine built from scratch.
        </p>
      </header>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {stats ? (
          <>
            <StatCard
              label="Due today"
              value={stats.dueCards}
              accent="text-accent"
              bar="bg-accent"
            />
            <StatCard label="Total cards" value={stats.totalCards} bar="bg-indigo" />
            <StatCard label="Reviewed today" value={stats.todayReviews} bar="bg-gold" />
            <StatCard
              label="Accuracy"
              value={stats.todayAccuracy == null ? null : stats.todayAccuracy}
              suffix="%"
              bar="bg-good"
            />
          </>
        ) : (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24" />)
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_260px]">
        <Link
          href="/session"
          className="press group relative block overflow-hidden rounded-2xl border border-accent/30 bg-panel p-6 shadow-warm transition-colors hover:border-accent"
        >
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-xl font-bold text-foreground">今日の日本語</span>
            <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
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
            Start today&apos;s session
            <ArrowRight size={16} weight="bold" className="transition-transform group-hover:translate-x-1" />
          </div>
        </Link>

        <div className="flex flex-col items-center justify-center rounded-2xl border border-line bg-panel p-5 text-center shadow-warm">
          <EnsoRing progress={goal} size={116} stroke={7}>
            <div className="leading-none">
              <div className="font-display text-xl font-bold text-foreground">
                {stats ? `${stats.todayReviews}/${stats.dueCards}` : "—"}
              </div>
              <div className="mt-1 text-xs text-muted">復習 today</div>
            </div>
          </EnsoRing>
          <div className="mt-3 text-xs text-muted">
            {goal >= 1 ? "Today’s reviews complete — 完了" : "Your enso grows as you review"}
          </div>
        </div>
      </div>

      {stats && stats.dueCards > 0 && (
        <Link
          href="/review"
          className="press group flex items-center justify-between rounded-2xl bg-accent px-6 py-5 text-white shadow-warm-lg transition-colors hover:bg-accent/95"
        >
          <div>
            <div className="text-lg font-bold">{stats.dueCards} cards ready to review</div>
            <div className="mt-0.5 text-sm opacity-85">
              {streak && streak > 0 ? `${streak}-day streak — keep it alive` : "Start your streak today"}
            </div>
          </div>
          <ArrowRight size={22} weight="bold" className="transition-transform group-hover:translate-x-1" />
        </Link>
      )}

      <div className="rounded-2xl border border-line bg-panel p-5 shadow-warm md:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="font-display text-lg font-semibold text-foreground">今日のことば</span>
            <LevelBadge level={wod.level} />
          </div>
          <SpeakButton text={wod.reading} size="sm" label="Hear today’s word" />
        </div>
        <div className="mt-5 flex flex-col items-start gap-4 md:flex-row md:items-center">
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-5xl font-bold tracking-wide text-accent"
          >
            {wod.word}
          </motion.div>
          <div className="min-w-0">
            <motion.div
              initial={reduce ? false : { opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="font-jp text-xl text-indigo"
            >
              {wod.reading}
            </motion.div>
            <div className="mt-0.5 text-sm text-muted">{wod.meaning}</div>
          </div>
        </div>
      </div>

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
                  className="group flex items-center gap-4 rounded-2xl border border-accent/30 bg-panel p-5 shadow-warm transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-warm-lg"
                >
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-accent-soft text-accent">
                    <Icon size={24} weight="duotone" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{m.label}</span>
                      <span className="rounded-full bg-accent px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider text-white">
                        Reading
                      </span>
                    </div>
                    <div className="text-sm text-muted">
                      Word-by-word furigana, tap-any-word tooltips, and conversation practice.
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
                className="group block rounded-2xl border border-line bg-panel p-5 shadow-warm transition-all hover:-translate-y-0.5 hover:border-accent hover:shadow-warm-lg"
              >
                <div className="mb-3 grid h-10 w-10 place-items-center rounded-2xl bg-panel-2 text-accent transition-colors group-hover:bg-accent-soft">
                  <Icon size={20} weight="duotone" />
                </div>
                <div className="font-semibold text-foreground">{m.label}</div>
                <div className="text-sm text-muted">{m.desc}</div>
              </Link>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  suffix,
  accent,
  bar,
}: {
  label: string;
  value: number | null;
  suffix?: string;
  accent?: string;
  bar?: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-line bg-panel p-4 shadow-warm">
      <div className={`absolute inset-x-0 top-0 h-0.5 ${bar ?? "bg-line"}`} />
      <div className={`text-2xl font-bold tabular-nums ${accent ?? ""}`}>
        {value == null ? "–" : (
          <>
            <CountUp value={value} />
            {suffix}
          </>
        )}
      </div>
      <div className="mt-1 text-xs text-muted">{label}</div>
    </div>
  );
}

function PlanRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-panel-2/60 px-3 py-2">
      <dt className="text-xs text-muted">{label}</dt>
      <dd className="text-lg font-bold tabular-nums text-foreground">{value}</dd>
    </div>
  );
}