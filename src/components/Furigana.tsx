const KANJI_RE = /[\u3400-\u4dbf\u4e00-\u9fff]/;

export function Furigana({ word, reading }: { word: string; reading?: string | null }) {
  if (!reading || !KANJI_RE.test(word)) return <>{word}</>;
  return (
    <ruby className="ruby-word">
      {word}
      <rp>(</rp>
      <rt>{reading}</rt>
      <rp>)</rp>
    </ruby>
  );
}
