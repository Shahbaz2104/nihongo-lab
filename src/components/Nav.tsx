"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/", label: "Overview", kanji: "概要" },
  { href: "/review", label: "Review", kanji: "復習" },
  { href: "/kana", label: "Kana", kanji: "かな" },
  { href: "/kanji", label: "Kanji", kanji: "漢字" },
  { href: "/vocab", label: "Vocab", kanji: "単語" },
  { href: "/grammar", label: "Grammar", kanji: "文法" },
  { href: "/quiz", label: "Quiz", kanji: "クイズ" },
  { href: "/stats", label: "Stats", kanji: "統計" },
];

export function Nav() {
  const pathname = usePathname();

  return (
    <aside className="border-b border-line px-5 py-4 lg:sticky lg:top-0 lg:h-screen lg:w-56 lg:border-b-0 lg:border-r lg:py-8">
      <div className="flex items-center gap-2 lg:mb-10">
        <div className="grid h-9 w-9 place-items-center rounded-lg bg-accent font-jp text-lg font-bold text-black">
          語
        </div>
        <div className="leading-tight">
          <div className="text-sm font-semibold tracking-wide">Nihongo Lab</div>
          <div className="text-[11px] text-muted">nihongo-lab</div>
        </div>
      </div>

      <nav className="scrollbar-thin flex gap-1 overflow-x-auto lg:flex-col lg:overflow-visible">
        {links.map((l) => {
          const active = pathname === l.href;
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`group flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                active
                  ? "bg-accent-soft text-accent"
                  : "text-muted hover:bg-panel hover:text-foreground"
              }`}
            >
              <span className="font-jp text-xs opacity-70">{l.kanji}</span>
              <span className="font-medium">{l.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
