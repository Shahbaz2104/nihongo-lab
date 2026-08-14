import { statSync } from "node:fs";
import path from "node:path";

interface DatasetInfo {
  files: string[];
  source: string;
  license: string;
  licenseUrl: string;
  note?: string;
}

const datasets: DatasetInfo[] = [
  {
    files: ["vocab/n1.json", "vocab/n2.json", "vocab/n3.json", "vocab/n4.json", "vocab/n5.json"],
    source: "OpenJLPT (https://github.com/evanclan/OpenJLPT)",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    note: "Derived from JMdict and KANJIDIC2 (EDRDG, CC BY-SA 4.0). The EDRDG license requires web-facing dictionary applications to refresh their data at least monthly.",
  },
  {
    files: ["kanji/n1.json", "kanji/n2.json", "kanji/n3.json", "kanji/n4.json", "kanji/n5.json"],
    source: "OpenJLPT (https://github.com/evanclan/OpenJLPT)",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
    note: "Derived from KANJIDIC2 (EDRDG, CC BY-SA 4.0).",
  },
  {
    files: ["grammar/n1.json", "grammar/n2.json", "grammar/n3.json", "grammar/n4.json", "grammar/n5.json"],
    source: "OpenJLPT (https://github.com/evanclan/OpenJLPT)",
    license: "CC BY-SA 4.0",
    licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  },
  {
    files: ["kana.json"],
    source: "Project-internal data (hiragana/katakana charts)",
    license: "Original",
    licenseUrl: "#",
  },
  {
    files: ["stories.json", "conversations.json"],
    source: "Original stories and conversation scripts written for this project",
    license: "Original",
    licenseUrl: "#",
  },
];

export default function AboutPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <header>
        <h1 className="text-2xl font-bold tracking-tight">About &amp; data licensing</h1>
        <p className="mt-1 text-sm text-muted">
          Where the learning data comes from, under which licenses, and when this bundle was generated.
        </p>
      </header>

      <div className="space-y-3">
        {datasets.map((d) => {
          const updated = latestUpdate(d.files);
          return (
            <div key={d.source + d.license} className="rounded-2xl border border-line bg-panel p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="font-semibold">{d.source}</div>
                <span className="rounded-md bg-panel-2 px-2 py-0.5 text-xs text-muted">Updated {updated}</span>
              </div>
              <div className="mt-1 text-sm">
                License:{" "}
                <a
                  href={d.licenseUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-accent underline decoration-accent/40 underline-offset-2"
                >
                  {d.license}
                </a>
              </div>
              {d.note && <div className="mt-2 text-sm text-muted">{d.note}</div>}
              <div className="mt-2 text-xs text-muted">
                Bundled files: {d.files.join(", ")}
              </div>
            </div>
          );
        })}
      </div>

      <div className="rounded-2xl border border-line bg-panel p-5">
        <div className="font-semibold">Dataset refresh policy</div>
        <p className="mt-2 text-sm text-muted">
          Datasets are bundled snapshots. The EDRDG license requires monthly refreshes for web-facing
          dictionary apps; run <code className="rounded bg-panel-2 px-1.5 py-0.5 text-xs">npm run datasets:check</code>{" "}
          to validate the bundle and see the last update dates, and follow{" "}
          <code className="rounded bg-panel-2 px-1.5 py-0.5 text-xs">scripts/update-datasets.ts</code> to refresh.
        </p>
      </div>
    </div>
  );
}

function latestUpdate(files: string[]): string {
  const cwd = process.cwd();
  const times: number[] = files.map((f) => {
    try {
      return statSync(path.join(cwd, "data", f)).mtimeMs;
    } catch {
      return 0;
    }
  });
  const latest = new Date(Math.max(...times));
  return Number.isFinite(latest.getTime()) && latest.getTime() > 0
    ? latest.toISOString().slice(0, 10)
    : "unknown";
}