import type { TokenSeg } from "@/lib/annotate";

const KANJI_RE = /[\u3400-\u4dbf\u4e00-\u9fff]/;

export function RubyText({ tokens }: { tokens: TokenSeg[] }) {
  return (
    <>
      {tokens.map((t, i) =>
        t.reading && KANJI_RE.test(t.text) ? (
          <ruby key={i}>
            {t.text}
            <rp>(</rp>
            <rt>{t.reading}</rt>
            <rp>)</rp>
          </ruby>
        ) : (
          <span key={i}>{t.text}</span>
        ),
      )}
    </>
  );
}
