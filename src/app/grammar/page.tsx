import { getGrammar, JLPT_LEVELS } from "@/lib/datasets";
import { annotate } from "@/lib/annotate";
import { GrammarBrowser } from "@/components/GrammarBrowser";

export default function GrammarPage() {
  const levels = Object.fromEntries(
    JLPT_LEVELS.map((l) => [
      l,
      getGrammar(l).map((g) => ({
        ...g,
        examples: g.examples.map((ex) => ({ ...ex, ...annotate(ex.ja) })),
      })),
    ]),
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Grammar</h1>
        <p className="mt-1 text-sm text-muted">
          JLPT grammar patterns with formation, example sentences, furigana and romaji.
        </p>
      </header>
      <GrammarBrowser levels={levels} />
    </div>
  );
}
