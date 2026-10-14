"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BookOpen,
  Books,
  CalendarCheck,
  Cards,
  ChartBar,
  Ear,
  House,
  Info,
  ListDashes,
  PencilSimpleLine,
  TextAa,
  Trophy,
} from "@phosphor-icons/react";
import { EnsoMark } from "@/components/ui/EnsoMark";

const links = [
  { href: "/", label: "Overview", kanji: "概要", icon: House },
  { href: "/review", label: "Review", kanji: "復習", icon: Cards },
  { href: "/kana", label: "Kana", kanji: "かな", icon: TextAa },
  { href: "/kanji", label: "Kanji", kanji: "漢字", icon: PencilSimpleLine },
  { href: "/vocab", label: "Vocab", kanji: "単語", icon: Books },
  { href: "/stories", label: "Stories", kanji: "物語", icon: BookOpen },
  { href: "/grammar", label: "Grammar", kanji: "文法", icon: ListDashes },
  { href: "/quiz", label: "Quiz", kanji: "クイズ", icon: Trophy },
  { href: "/session", label: "Session", kanji: "セッション", icon: CalendarCheck },
  { href: "/listening", label: "Listening", kanji: "聞き取り", icon: Ear },
  { href: "/stats", label: "Stats", kanji: "統計", icon: ChartBar },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-line bg-background/85 backdrop-blur-sm lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:border-b-0 lg:border-r lg:py-8">
      <div className="flex items-center gap-2.5 px-4 py-2 lg:mb-10 lg:px-5">
        <EnsoMark size={36} />
        <div className="leading-tight">
          <div className="font-display text-sm font-semibold tracking-wide text-foreground">
            Nihongo Lab
          </div>
          <div className="text-[11px] text-muted">日本語ラボ</div>
        </div>
      </div>

      <nav className="no-scrollbar flex gap-1 overflow-x-auto px-3 pb-3 lg:flex-col lg:overflow-visible lg:px-2 lg:pb-0">
        {links.map((l) => {
          const active = pathname === l.href;
          const Icon = l.icon;
          return (
            <Link
              key={l.href}
              href={l.href}
              aria-current={active ? "page" : undefined}
              className={`press group flex h-10 shrink-0 items-center gap-2.5 rounded-full px-3.5 text-sm transition-colors lg:rounded-xl ${
                active
                  ? "bg-accent font-semibold text-white shadow-warm"
                  : "text-muted hover:bg-panel hover:text-foreground"
              }`}
            >
              <Icon
                size={15}
                weight={active ? "fill" : "duotone"}
                className={active ? "text-white" : "opacity-70"}
              />
              <span className="whitespace-nowrap font-medium">{l.label}</span>
              <span className="ml-auto hidden font-jp text-[11px] opacity-60 lg:block">{l.kanji}</span>
            </Link>
          );
        })}

        <Link
          href="/about"
          aria-current={pathname === "/about" ? "page" : undefined}
          className={`press group flex h-10 shrink-0 items-center gap-2.5 rounded-full px-3.5 text-sm transition-colors lg:rounded-xl ${
            pathname === "/about"
              ? "bg-accent font-semibold text-white shadow-warm"
              : "text-muted hover:bg-panel hover:text-foreground"
          }`}
        >
          <Info size={15} weight="duotone" className="opacity-70" />
          <span className="whitespace-nowrap font-medium">About</span>
        </Link>
      </nav>

      <div className="mt-10 hidden rounded-2xl border border-line bg-panel p-4 shadow-warm lg:block">
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