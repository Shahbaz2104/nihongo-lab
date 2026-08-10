import { getVocab, JLPT_LEVELS } from "@/lib/datasets";
import { VocabBrowser } from "@/components/VocabBrowser";

export default function VocabPage() {
  const levels = Object.fromEntries(JLPT_LEVELS.map((l) => [l, getVocab(l)]));
  const total = JLPT_LEVELS.reduce((n, l) => n + getVocab(l).length, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Vocabulary</h1>
        <p className="mt-1 text-sm text-muted">{total.toLocaleString()} JLPT words with readings and meanings.</p>
      </header>
      <VocabBrowser levels={levels} />
    </div>
  );
}
