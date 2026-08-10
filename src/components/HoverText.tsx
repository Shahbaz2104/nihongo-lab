import type { Token } from "@/lib/tokenizer";
import { Furigana } from "@/components/Furigana";

export function HoverText({ tokens, className }: { tokens: Token[]; className?: string }) {
  return (
    <span className={className}>
      {tokens.map((t, i) => {
        const hint = t.reading && t.meanings.length > 0;
        if (!hint) return <span key={i}>{t.text}</span>;

        return (
          <span key={i} className="group relative inline-block cursor-help">
            <Furigana word={t.text} reading={t.reading} />
            <span className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-2 hidden max-w-xs -translate-x-1/2 whitespace-normal rounded-xl border border-line bg-panel-2 px-3 py-2 text-left shadow-2xl shadow-black/50 group-hover:block">
              <span className="mb-1 flex flex-wrap items-baseline gap-x-2 text-xs">
                <span className="font-jp text-sm text-accent">{t.text}</span>
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
