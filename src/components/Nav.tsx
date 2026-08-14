"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Books,
  Cards,
  ChartBar,
  Ear,
  House,
  ListDashes,
  PencilSimpleLine,
  TextAa,
  Trophy,
} from "@phosphor-icons/react";

const links = [
  { href: "/", label: "Overview", kanji: "概要", icon: House },
  { href: "/review", label: "Review", kanji: "復習", icon: Cards },
  { href: "/kana", label: "Kana", kanji: "かな", icon: TextAa },
  { href: "/kanji", label: "Kanji", kanji: "漢字", icon: PencilSimpleLine },
  { href: "/vocab", label: "Vocab", kanji: "単語", icon: Books },
  { href: "/stories", label: "Stories", kanji: "物語", icon: BookOpen },
  { href: "/grammar", label: "Grammar", kanji: "文法", icon: ListDashes },
  { href: "/quiz", label: "Quiz", kanji: "クイズ", icon: Trophy },
  { href: "/listening", label: "Listening", kanji: "聞き取り", icon: Ear },
  { href: "/stats", label: "Stats", kanji: "統計", icon: ChartBar },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-line px-5 py-4 lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:border-b-0 lg:border-r lg:py-8">
      <div className="flex items-center gap-2.5 lg:mb-10">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent font-jp text-lg font-bold text-black">
          語
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-wide">Nihongo Lab</div>
          <div className="text-[11px] text-muted">日本語ラボ</div>
        </div>
      </div>

      <nav className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1 lg:flex-col lg:overflow-visible lg:px-0">
        {links.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`group relative flex shrink-0 items-center gap-2.5 rounded-xl px-3 py-2 text-sm transition-colors ${
                active ? "bg-accent-soft text-accent" : "text-muted hover:bg-panel hover:text-foreground"
              }`}
            >
              <Icon
                size={16}
                weight={active ? "fill" : "duotone"}
                className={active ? "text-accent" : "opacity-70"}
              />
              <span className="whitespace-nowrap font-medium">{l.label}</span>
              <span className="ml-auto hidden font-jp text-[11px] opacity-60 lg:block">{l.kanji}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-10 hidden rounded-xl border border-line bg-panel/60 p-4 lg:block">
        <div className="flex items-center gap-2 text-[11px] uppercase tracking-widest text-muted">
          <span className="h-1.5 w-1.5 rounded-full bg-good" />
          Study mode
        </div>
        <p className="mt-2 text-xs leading-relaxed text-muted">
          Build a streak by reviewing at least a few cards every day. Grading
          honestly keeps SM-2 intervals accurate.
        </p>
      </div>
    </aside>
  );
}
