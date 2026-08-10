import { getGrammar, JLPT_LEVELS } from "@/lib/datasets";
import { GrammarBrowser } from "@/components/GrammarBrowser";

export default function GrammarPage() {
  const levels = Object.fromEntries(JLPT_LEVELS.map((l) => [l, getGrammar(l)]));

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold">Grammar</h1>
        <p className="mt-1 text-sm text-muted">JLPT grammar patterns with formation and example sentences.</p>
      </header>
      <GrammarBrowser levels={levels} />
    </div>
  );
}
