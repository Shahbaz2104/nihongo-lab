import { getKanji, JLPT_LEVELS } from "@/lib/datasets";
import { KanjiBrowser } from "@/components/KanjiBrowser";

export default function KanjiPage() {
  const levels = Object.fromEntries(JLPT_LEVELS.map((l) => [l, getKanji(l)]));
  const total = JLPT_LEVELS.reduce((n, l) => n + getKanji(l).length, 0);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Kanji</h1>
        <p className="mt-1 text-sm text-muted">
          {total.toLocaleString()} kanji across JLPT N5–N1 with stroke order and readings.
        </p>
      </header>
      <KanjiBrowser levels={levels} />
    </div>
  );
}
