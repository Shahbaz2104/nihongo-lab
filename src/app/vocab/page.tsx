import { getVocab, JLPT_LEVELS } from "@/lib/datasets";
import { annotate } from "@/lib/annotate";
import { VocabBrowser } from "@/components/VocabBrowser";

export default function VocabPage() {
  const levels = Object.fromEntries(
    JLPT_LEVELS.map((l) => [
      l,
      getVocab(l).map((v) => ({
        ...v,
        examples: (v.examples ?? []).map((ex, i) =>
          i === 0 ? { ...ex, ...annotate(ex.ja) } : { ...ex, tokens: [], romaji: "" },
        ),
      })),
    ]),
  );
  const total = JLPT_LEVELS.reduce((n, l) => n + getVocab(l).length, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Vocabulary</h1>
        <p className="mt-1 text-sm text-muted">
          {total.toLocaleString()} JLPT words with kanji, readings, meanings and example phrases.
        </p>
      </header>
      <VocabBrowser levels={levels} />
    </div>
  );
}
