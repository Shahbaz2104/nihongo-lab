import { readFileSync } from "node:fs";
import path from "node:path";
import { StatsDashboard } from "@/components/StatsDashboard";

interface StoryRaw {
  id: string;
  sentences: { jp: string; en: string }[];
}

export default function StatsPage() {
  const stories = readFileSync(path.join(process.cwd(), "data", "stories.json"), "utf8");
  const storiesParsed = JSON.parse(stories) as StoryRaw[];

  return <StatsDashboard stories={storiesParsed.map((s) => ({ id: s.id, sentences: s.sentences.length }))} />;
}