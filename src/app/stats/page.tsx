import { StatsDashboard } from "@/components/StatsDashboard";
import { readJson } from "@/lib/datasets";

interface StoryRaw {
  id: string;
  sentences: { jp: string; en: string }[];
}

export default function StatsPage() {
  const storiesParsed = readJson<StoryRaw[]>("stories.json");

  return <StatsDashboard stories={storiesParsed.map((s) => ({ id: s.id, sentences: s.sentences.length }))} />;
}