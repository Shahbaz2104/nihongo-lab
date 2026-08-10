import { getVocab, getKanji, type VocabItem, type KanjiItem, type JlptLevel } from "@/lib/datasets";
import { kanaToRomaji } from "@/lib/romaji";

export interface Token {
  text: string;
  reading: string;
  romaji: string;
  meanings: string[];
  level: JlptLevel | null;
  type: "word" | "particle" | "char";
}

interface Particle {
  text: string;
  reading: string;
  romaji: string;
  meaning: string;
}

const PARTICLES: Particle[] = [
  { text: "ありがとうございます", reading: "ありがとうございます", romaji: "arigatou gozaimasu", meaning: "thank you" },
  { text: "こんにちは", reading: "こんにちは", romaji: "konnichiwa", meaning: "hello" },
  { text: "おはようございます", reading: "おはようございます", romaji: "ohayou gozaimasu", meaning: "good morning" },
  { text: "お願いします", reading: "おねがいします", romaji: "onegai shimasu", meaning: "please" },
  { text: "ごちそうさまでした", reading: "ごちそうさまでした", romaji: "gochisousama deshita", meaning: "thanks for the meal" },
  { text: "はじめまして", reading: "はじめまして", romaji: "hajimemashite", meaning: "nice to meet you" },
  { text: "どういたしまして", reading: "どういたしまして", romaji: "douitashimashite", meaning: "you're welcome" },
  { text: "では", reading: "では", romaji: "dewa", meaning: "well then" },
  { text: "から", reading: "から", romaji: "kara", meaning: "from / because" },
  { text: "まで", reading: "まで", romaji: "made", meaning: "until / to" },
  { text: "より", reading: "より", romaji: "yori", meaning: "than / from" },
  { text: "ほど", reading: "ほど", romaji: "hodo", meaning: "to the extent of" },
  { text: "しか", reading: "しか", romaji: "shika", meaning: "only (with negative)" },
  { text: "だけ", reading: "だけ", romaji: "dake", meaning: "only" },
  { text: "など", reading: "など", romaji: "nado", meaning: "and so on" },
  { text: "こそ", reading: "こそ", romaji: "koso", meaning: "emphasis" },
  { text: "ので", reading: "ので", romaji: "node", meaning: "because" },
  { text: "のに", reading: "のに", romaji: "noni", meaning: "even though" },
  { text: "ても", reading: "ても", romaji: "temo", meaning: "even if" },
  { text: "でも", reading: "でも", romaji: "demo", meaning: "but" },
  { text: "けど", reading: "けど", romaji: "kedo", meaning: "but" },
  { text: "ではない", reading: "ではない", romaji: "dewa nai", meaning: "is not" },
  { text: "ではありません", reading: "ではありません", romaji: "dewa arimasen", meaning: "is not" },
  { text: "ですか", reading: "ですか", romaji: "desu ka", meaning: "is it…? (question)" },
  { text: "ですね", reading: "ですね", romaji: "desu ne", meaning: "isn't it?" },
  { text: "ですが", reading: "ですが", romaji: "desu ga", meaning: "is, but" },
  { text: "です", reading: "です", romaji: "desu", meaning: "is / to be" },
  { text: "ました", reading: "ました", romaji: "mashita", meaning: "polite past ending" },
  { text: "ません", reading: "ません", romaji: "masen", meaning: "polite negative ending" },
  { text: "ます", reading: "ます", romaji: "masu", meaning: "polite ending" },
  { text: "が", reading: "が", romaji: "ga", meaning: "subject marker / but" },
  { text: "を", reading: "を", romaji: "wo", meaning: "object marker" },
  { text: "に", reading: "に", romaji: "ni", meaning: "in / at / to" },
  { text: "で", reading: "で", romaji: "de", meaning: "at / by / with" },
  { text: "と", reading: "と", romaji: "to", meaning: "and / with" },
  { text: "の", reading: "の", romaji: "no", meaning: "possessive の" },
  { text: "も", reading: "も", romaji: "mo", meaning: "also" },
  { text: "へ", reading: "へ", romaji: "e", meaning: "to (direction)" },
  { text: "は", reading: "は", romaji: "wa", meaning: "topic marker" },
  { text: "か", reading: "か", romaji: "ka", meaning: "question marker" },
  { text: "ね", reading: "ね", romaji: "ne", meaning: "isn't it?" },
  { text: "よ", reading: "よ", romaji: "yo", meaning: "emphasis" },
  { text: "て", reading: "て", romaji: "te", meaning: "te-form connector" },
  { text: "じゃ", reading: "じゃ", romaji: "ja", meaning: "well then" },
];

interface Override {
  text: string;
  reading: string;
  meanings: string[];
}

const OVERRIDES: Override[] = [
  { text: "いらっしゃいませ", reading: "いらっしゃいませ", meanings: ["welcome (to a shop)"] },
  { text: "何にしますか", reading: "なににしますか", meanings: ["what would you like?"] },
  { text: "どちらにしますか", reading: "どちらにしますか", meanings: ["which would you like?"] },
  { text: "よろしいですか", reading: "よろしいですか", meanings: ["is that alright?"] },
  { text: "ホット", reading: "ホット", meanings: ["hot"] },
  { text: "アイス", reading: "アイス", meanings: ["iced"] },
  { text: "すみません", reading: "すみません", meanings: ["excuse me / sorry"] },
  { text: "勉強しています", reading: "べんきょうしている", meanings: ["studying (progressive)"] },
  { text: "勉強します", reading: "べんきょうする", meanings: ["to study"] },
  { text: "行きたいです", reading: "いきたいです", meanings: ["want to go"] },
  { text: "行きたい", reading: "いきたい", meanings: ["want to go"] },
  { text: "なりたいです", reading: "なりたいです", meanings: ["want to become"] },
  { text: "なりたい", reading: "なりたい", meanings: ["want to become"] },
  { text: "起きました", reading: "おきました", meanings: ["got up"] },
  { text: "起きます", reading: "おきます", meanings: ["to get up"] },
  { text: "あります", reading: "あります", meanings: ["there is / to exist"] },
  { text: "います", reading: "います", meanings: ["to exist (animate) / there is"] },
  { text: "しています", reading: "しています", meanings: ["doing (progressive)"] },
  { text: "できます", reading: "できます", meanings: ["can do"] },
  { text: "しました", reading: "しました", meanings: ["did"] },
  { text: "でした", reading: "でした", meanings: ["was"] },
  { text: "しません", reading: "しません", meanings: ["do not do"] },
  { text: "行きました", reading: "いきました", meanings: ["went"] },
  { text: "行きます", reading: "いきます", meanings: ["to go"] },
  { text: "食べました", reading: "たべました", meanings: ["ate"] },
  { text: "食べます", reading: "たべます", meanings: ["to eat"] },
  { text: "読みました", reading: "よみました", meanings: ["read (past)"] },
  { text: "読みます", reading: "よみます", meanings: ["to read"] },
  { text: "買いました", reading: "かいました", meanings: ["bought"] },
  { text: "買います", reading: "かいます", meanings: ["to buy"] },
  { text: "磨きます", reading: "みがきます", meanings: ["to brush / polish"] },
  { text: "始まります", reading: "はじまります", meanings: ["to begin"] },
  { text: "覚えます", reading: "おぼえます", meanings: ["to memorize"] },
  { text: "話します", reading: "はなします", meanings: ["to speak"] },
  { text: "洗って", reading: "あらって", meanings: ["wash (te-form)"] },
  { text: "座って", reading: "すわって", meanings: ["sit (te-form)"] },
  { text: "散歩しました", reading: "さんぽしました", meanings: ["took a walk"] },
  { text: "来ました", reading: "きました", meanings: ["came"] },
  { text: "わかりました", reading: "わかりました", meanings: ["understood"] },
  { text: "良かった", reading: "よかった", meanings: ["was good"] },
  { text: "七時半", reading: "しちじはん", meanings: ["7:30"] },
  { text: "六時", reading: "ろくじ", meanings: ["6 o'clock"] },
  { text: "七時", reading: "しちじ", meanings: ["7 o'clock"] },
  { text: "八時", reading: "はちじ", meanings: ["8 o'clock"] },
  { text: "一時", reading: "いちじ", meanings: ["1 o'clock"] },
  { text: "二時", reading: "にじ", meanings: ["2 o'clock"] },
  { text: "三時", reading: "さんじ", meanings: ["3 o'clock"] },
  { text: "四時", reading: "よじ", meanings: ["4 o'clock"] },
  { text: "五時", reading: "ごじ", meanings: ["5 o'clock"] },
  { text: "九時", reading: "くじ", meanings: ["9 o'clock"] },
  { text: "十時", reading: "じゅうじ", meanings: ["10 o'clock"] },
  { text: "日本語", reading: "にほんご", meanings: ["Japanese (language)"] },
  { text: "日本", reading: "にほん", meanings: ["Japan"] },
  { text: "朝ごはん", reading: "あさごはん", meanings: ["breakfast"] },
  { text: "昼ごはん", reading: "ひるごはん", meanings: ["lunch"] },
  { text: "牛乳", reading: "ぎゅうにゅう", meanings: ["milk"] },
  { text: "こんばんは", reading: "こんばんは", meanings: ["good evening"] },
  { text: "いただきます", reading: "いただきます", meanings: ["thank you for the meal (before eating)"] },
  { text: "さようなら", reading: "さようなら", meanings: ["goodbye"] },
  { text: "おやすみなさい", reading: "おやすみなさい", meanings: ["good night"] },
  { text: "ごめんなさい", reading: "ごめんなさい", meanings: ["I'm sorry"] },
  { text: "どうぞ", reading: "どうぞ", meanings: ["here you go / please"] },
  { text: "ごゆっくり", reading: "ごゆっくり", meanings: ["take your time"] },
  { text: "お会計", reading: "おかいけい", meanings: ["the check / bill"] },
  { text: "お元気ですか", reading: "おげんきですか", meanings: ["how are you?"] },
  { text: "お国", reading: "おくに", meanings: ["home country"] },
  { text: "また会いましょう", reading: "またあいましょう", meanings: ["let's meet again"] },
  { text: "どちら", reading: "どちら", meanings: ["which / which one"] },
  { text: "私", reading: "わたし", meanings: ["I / me"] },
];

const OVERRIDE_SORTED = OVERRIDES.slice().sort((a, b) => b.text.length - a.text.length);

const PARTICLE_TEXTS = new Set(PARTICLES.map((p) => p.text));
const JUNK_READING = /^[（(]|[\u3000-\u303f]/;

let cachedIndex: Map<string, VocabItem[]> | null = null;
let cachedKanji: Map<string, KanjiItem> | null = null;

function getKanjiIndex(): Map<string, KanjiItem> {
  if (cachedKanji) return cachedKanji;
  const map = new Map<string, KanjiItem>();
  for (const level of ["N5", "N4", "N3", "N2", "N1"] as JlptLevel[]) {
    for (const item of getKanji(level)) {
      if (!map.has(item.character)) map.set(item.character, item);
    }
  }
  cachedKanji = map;
  return map;
}

function getIndex(): Map<string, VocabItem[]> {
  if (cachedIndex) return cachedIndex;
  const index = new Map<string, VocabItem[]>();
  for (const level of ["N5", "N4", "N3", "N2", "N1"] as JlptLevel[]) {
    for (const item of getVocab(level)) {
      if (PARTICLE_TEXTS.has(item.word) && item.word.length <= 2) continue;
      if (JUNK_READING.test(item.reading)) continue;
      const first = item.word[0];
      let bucket = index.get(first);
      if (!bucket) {
        bucket = [];
        index.set(first, bucket);
      }
      bucket.push(item);
    }
  }
  for (const bucket of index.values()) {
    bucket.sort((a, b) => b.word.length - a.word.length);
  }
  cachedIndex = index;
  return index;
}

const isKana = (ch: string) => /[\u3040-\u30ff]/.test(ch);

export function tokenize(text: string): Token[] {
  const index = getIndex();
  const kanjiIndex = getKanjiIndex();
  const tokens: Token[] = [];
  let i = 0;

  while (i < text.length) {
    const ch = text[i];

    const override = OVERRIDE_SORTED.find((o) => text.startsWith(o.text, i));
    if (override) {
      tokens.push({
        text: override.text,
        reading: override.reading,
        romaji: kanaToRomaji(override.reading),
        meanings: override.meanings,
        level: null,
        type: "word",
      });
      i += override.text.length;
      continue;
    }

    const bucket = index.get(ch);
    let matched: VocabItem | null = null;
    if (bucket) {
      for (const item of bucket) {
        if (text.startsWith(item.word, i)) {
          matched = item;
          break;
        }
      }
    }

    if (matched) {
      tokens.push({
        text: matched.word,
        reading: matched.reading,
        romaji: kanaToRomaji(matched.reading),
        meanings: matched.meanings,
        level: matched.level,
        type: "word",
      });
      i += matched.word.length;
      continue;
    }

    const particle = PARTICLES.find((p) => text.startsWith(p.text, i));
    if (particle) {
      tokens.push({
        text: particle.text,
        reading: particle.reading,
        romaji: particle.romaji,
        meanings: [particle.meaning],
        level: null,
        type: "particle",
      });
      i += particle.text.length;
      continue;
    }

    const kanjiInfo = /[\u3400-\u4dbf\u4e00-\u9fff]/.test(ch) ? kanjiIndex.get(ch) : undefined;
    if (kanjiInfo) {
      const reading =
        kanjiInfo.kunyomi.find((k) => /^[\u3040-\u30ff]+$/.test(k)) ?? kanjiInfo.onyomi[0] ?? "";
      tokens.push({
        text: ch,
        reading,
        romaji: reading ? kanaToRomaji(reading) : "",
        meanings: kanjiInfo.meanings.slice(0, 3),
        level: kanjiInfo.level,
        type: "char",
      });
      i += 1;
      continue;
    }

    tokens.push({
      text: ch,
      reading: isKana(ch) ? ch : "",
      romaji: isKana(ch) ? kanaToRomaji(ch) : "",
      meanings: [],
      level: null,
      type: "char",
    });
    i += 1;
  }

  return tokens;
}
