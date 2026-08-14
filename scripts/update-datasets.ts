/**
 * Validate bundled datasets and report versions.
 *
 * Run: npm run datasets:check
 *
 * This script does NOT download anything — it verifies the bundled JSON
 * snapshots in data/ are well-formed, level-scoped, and free of duplicate
 * source keys, then prints last-update dates.
 *
 * Refreshing the bundle (manual workflow, since upstream downloads are
 * network-dependent):
 *
 *   1. Download the current OpenJLPT release snapshots
 *      (https://github.com/evanclan/OpenJLPT) for vocab, kanji, and grammar.
 *   2. Transform each into the expected JSON shape (see src/lib/datasets.ts
 *      for the exact interfaces) and write into data/<type>/<level>.json.
 *   3. Re-run this script — it must pass before committing the refresh.
 *   4. Commit the new snapshots together with the new update dates printed
 *      here. The /about page reflects these dates automatically.
 *
 * The EDRDG license requires web-facing dictionary apps to refresh their
 * JMdict/KANJIDIC2-derived data at least monthly.
 */
import { readFileSync, statSync } from "node:fs";
import path from "node:path";

const LEVELS = ["n1", "n2", "n3", "n4", "n5"];
const VOCAB_FIELDS = ["word", "reading", "meanings"];
const VOCAB_OPTIONAL = ["examples"];
const KANJI_FIELDS = ["character", "level", "strokes", "onyomi", "kunyomi", "meanings"];
const GRAMMAR_FIELDS = ["pattern", "level", "meaning", "formation", "examples"];

let failed = false;

function validate(type: string, fields: string[], optional: string[] = []): number {
  let count = 0;
  for (const level of LEVELS) {
    const rel = `data/${type}/${level}.json`;
    const file = path.join(process.cwd(), rel);
    let raw: unknown;
    try {
      raw = JSON.parse(readFileSync(file, "utf8"));
    } catch (err) {
      console.error(`✗ ${rel}: cannot parse (${err instanceof Error ? err.message : err})`);
      failed = true;
      continue;
    }
    if (!Array.isArray(raw) || raw.length === 0) {
      console.error(`✗ ${rel}: expected a non-empty array`);
      failed = true;
      continue;
    }
    const keys = new Set<string>();
    const sourceKey = type === "vocab" ? "word" : type === "kanji" ? "character" : "pattern";
    let problems = 0;
    for (const item of raw as Record<string, unknown>[]) {
      if (typeof item !== "object" || item === null) {
        problems++;
        continue;
      }
      for (const f of fields) {
        if (item[f] === undefined) {
          console.error(`  ✗ ${rel}: item missing "${f}"`);
          problems++;
          break;
        }
      }
      const k = String(item[sourceKey] ?? "");
      if (!k || keys.has(k)) {
        console.error(`  ✗ ${rel}: duplicate or empty ${sourceKey}: "${k}"`);
        problems++;
      }
      keys.add(k);
    }
    if (problems > 0) failed = true;
    count += (raw as unknown[]).length;
    const missingOptional = (raw as Record<string, unknown>[]).filter((i) => optional.some((f) => i[f] === undefined)).length;
    console.log(
      `  ✓ ${rel}: ${(raw as unknown[]).length} items${missingOptional ? ` (${missingOptional} without optional ${optional.join("/")})` : ""}`,
    );
  }
  return count;
}

function checkKana(): number {
  const rel = "data/kana.json";
  const file = path.join(process.cwd(), rel);
  const raw = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>[];
  const seen = new Set<string>();
  for (const item of raw) {
    const k = String(item["char"] ?? "");
    if (!k || seen.has(k)) {
      console.error(`  ✗ ${rel}: duplicate or empty char`);
      failed = true;
    }
    seen.add(k);
  }
  console.log(`  ✓ ${rel}: ${raw.length} items`);
  return raw.length;
}

function fmtDate(file: string): string {
  try {
    return statSync(file).mtime.toISOString().slice(0, 10);
  } catch {
    return "missing";
  }
}

const cwd = process.cwd();
const targets: { name: string; run: () => number; files: string[] }[] = [
  { name: "Vocab", run: () => validate("vocab", VOCAB_FIELDS, VOCAB_OPTIONAL), files: LEVELS.map((l) => `data/vocab/${l}.json`) },
  { name: "Kanji", run: () => validate("kanji", KANJI_FIELDS), files: LEVELS.map((l) => `data/kanji/${l}.json`) },
  { name: "Grammar", run: () => validate("grammar", GRAMMAR_FIELDS), files: LEVELS.map((l) => `data/grammar/${l}.json`) },
  { name: "Kana", run: checkKana, files: ["data/kana.json"] },
];

console.log("Validating bundled datasets...\n");
const totals: Record<string, number> = {};
for (const t of targets) {
  console.log(`${t.name}:`);
  totals[t.name] = t.run();
  console.log();
}

console.log("Bundle update dates (what the /about page reports):");
for (const t of targets) {
  const dates = t.files.map((f) => path.join(cwd, f)).map(fmtDate);
  console.log(`  ${t.name}: ${[...new Set(dates)].join(", ")}`);
}

if (failed) {
  console.error("\n✗ Dataset validation FAILED — do not commit this bundle.");
  process.exit(1);
}
console.log(`\n✓ All ${Object.values(totals).reduce((a, b) => a + b, 0)} items valid.`);
