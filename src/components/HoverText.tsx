import type { Token } from "@/lib/tokenizer";
import { Furigana } from "@/components/Furigana";

export function HoverText({ tokens, className }: { tokens: Token[]; className?: string }) {
  return (
    <span className={className}>
      {tokens.map((t, i) => {
        const hint = t.reading && t.meanings.length > 0;
        if (!hint) return <span key={i}>{t.text}</span>;

        return (
          <span
            key={i}
            className="group/word relative mx-0.5 inline-block cursor-help rounded-sm transition-colors hover:bg-accent-soft"
          >
            <Furigana word={t.text} reading={t.reading} />
            <span className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden w-max max-w-xs -translate-x-1/2 whitespace-normal rounded-xl border border-line bg-panel-2/95 px-3 py-2 text-left shadow-2xl shadow-black/60 backdrop-blur-sm group-hover/word:block">
              <span className="mb-1 flex flex-wrap items-baseline gap-x-2 text-xs">
                <span className="font-jp text-sm font-bold text-accent">{t.text}</span>
                <span className="font-jp text-foreground/90">{t.reading}</span>
                <span className="text-[10px] uppercase tracking-wider text-indigo">{t.romaji}</span>
              </span>
              <span className="block text-xs leading-snug text-muted">
                {t.meanings.slice(0, 3).join(" · ")}
              </span>
            </span>
          </span>
        );
      })}
    </span>
  );
}
