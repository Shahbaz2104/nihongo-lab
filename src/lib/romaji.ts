const HIRA = {
  あ: "a", い: "i", う: "u", え: "e", お: "o",
  か: "ka", き: "ki", く: "ku", け: "ke", こ: "ko",
  さ: "sa", し: "shi", す: "su", せ: "se", そ: "so",
  た: "ta", ち: "chi", つ: "tsu", て: "te", と: "to",
  な: "na", に: "ni", ぬ: "nu", ね: "ne", の: "no",
  は: "ha", ひ: "hi", ふ: "fu", へ: "he", ほ: "ho",
  ま: "ma", み: "mi", む: "mu", め: "me", も: "mo",
  や: "ya", ゆ: "yu", よ: "yo",
  ら: "ra", り: "ri", る: "ru", れ: "re", ろ: "ro",
  わ: "wa", を: "wo", ん: "n",
  が: "ga", ぎ: "gi", ぐ: "gu", げ: "ge", ご: "go",
  ざ: "za", じ: "ji", ず: "zu", ぜ: "ze", ぞ: "zo",
  だ: "da", ぢ: "ji", づ: "zu", で: "de", ど: "do",
  ば: "ba", び: "bi", ぶ: "bu", べ: "be", ぼ: "bo",
  ぱ: "pa", ぴ: "pi", ぷ: "pu", ぺ: "pe", ぽ: "po",
  ゃ: "ya", ゅ: "yu", ょ: "yo", っ: "tsu",
} as const;

const KATA = {
  ア: "a", イ: "i", ウ: "u", エ: "e", オ: "o",
  カ: "ka", キ: "ki", ク: "ku", ケ: "ke", コ: "ko",
  サ: "sa", シ: "shi", ス: "su", セ: "se", ソ: "so",
  タ: "ta", チ: "chi", ツ: "tsu", テ: "te", ト: "to",
  ナ: "na", ニ: "ni", ヌ: "nu", ネ: "ne", ノ: "no",
  ハ: "ha", ヒ: "hi", フ: "fu", ヘ: "he", ホ: "ho",
  マ: "ma", ミ: "mi", ム: "mu", メ: "me", モ: "mo",
  ヤ: "ya", ユ: "yu", ヨ: "yo",
  ラ: "ra", リ: "ri", ル: "ru", レ: "re", ロ: "ro",
  ワ: "wa", ヲ: "wo", ン: "n",
  ガ: "ga", ギ: "gi", グ: "gu", ゲ: "ge", ゴ: "go",
  ザ: "za", ジ: "ji", ズ: "zu", ゼ: "ze", ゾ: "zo",
  ダ: "da", ヂ: "ji", ヅ: "zu", デ: "de", ド: "do",
  バ: "ba", ビ: "bi", ブ: "bu", ベ: "be", ボ: "bo",
  パ: "pa", ピ: "pi", プ: "pu", ペ: "pe", ポ: "po",
  ャ: "ya", ュ: "yu", ョ: "yo", ッ: "tsu",
} as const;

const SMALL_Y: Record<string, string> = { ゃ: "a", ゅ: "u", ょ: "o", ャ: "a", ュ: "u", ョ: "o" };

const Y_DROP_TAILS = ["shi", "chi", "ji"];

export function kanaToRomaji(input: string): string {
  let out = "";
  let geminate = false;
  let prev: string | null = null;

  for (const ch of input) {
    const map = HIRA[ch as keyof typeof HIRA] ?? KATA[ch as keyof typeof KATA];

    if (ch === "ー") {
      if (prev && /[aeiou]$/.test(prev)) {
        out += prev.slice(-1);
        prev += prev.slice(-1);
      } else {
        out += "ー";
      }
      continue;
    }

    if (!map) {
      out += ch;
      geminate = false;
      prev = null;
      continue;
    }

    if (SMALL_Y[ch] && prev) {
      const p = prev;
      const vowel = SMALL_Y[ch];
      let tail: string;
      if (Y_DROP_TAILS.some((t) => p.endsWith(t))) {
        tail = `${p.slice(0, -1)}${vowel}`;
      } else if (p.endsWith("i")) {
        tail = `${p.slice(0, -1)}y${vowel}`;
      } else {
        tail = p;
      }
      out = `${out.slice(0, out.length - p.length)}${tail}`;
      prev = tail;
      continue;
    }

    if (ch === "っ" || ch === "ッ") {
      geminate = true;
      prev = null;
      continue;
    }

    let roma = map;
    if (geminate && /^[a-z]/.test(roma)) {
      roma = roma[0] + roma;
    }
    out += roma;
    geminate = false;
    prev = roma;
  }

  return out;
}
