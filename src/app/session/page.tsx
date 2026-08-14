import { readFileSync } from "node:fs";
import path from "node:path";
import { Session } from "@/components/Session";
import { tokenize } from "@/lib/tokenizer";

interface StoryRaw {
  id: string;
  title: string;
  titleEn: string;
  level: string;
  sentences: { jp: string; en: string }[];
}

interface ConversationRaw {
  id: string;
  title: string;
  titleEn: string;
  level: string;
  turns: {
    speaker: string;
    jp: string;
    en: string;
    correct?: number;
    options?: { jp: string; en: string }[];
  }[];
}

function readJson<T>(rel: string): T {
  const file = readFileSync(path.join(process.cwd(), "data", rel), "utf8");
  return JSON.parse(file) as T;
}

export default function SessionPage() {
  const storiesRaw = readJson<StoryRaw[]>("stories.json");
  const convRaw = readJson<ConversationRaw[]>("conversations.json");

  const stories = storiesRaw.map((s) => ({
    ...s,
    sentences: s.sentences.map((sen) => ({ ...sen, tokens: tokenize(sen.jp) })),
  }));

  const conversations = convRaw.map((c) => ({
    ...c,
    turns: c.turns.map((t) => ({
      speaker: t.speaker,
      jp: t.jp,
      en: t.en,
      tokens: tokenize(t.jp),
      options: (t.options ?? []).map((o, i) => ({
        ...o,
        tokens: tokenize(o.jp),
        correct: i === t.correct,
      })),
    })),
  }));

  return (
    <div className="space-y-6">
      <Session stories={stories} conversations={conversations} />
    </div>
  );
}