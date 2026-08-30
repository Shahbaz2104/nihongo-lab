# Content Plan — N5 expansion + light conjugation

Date: 2026-08-17

**Dependency:** the StoryReader stub fix (`docs/FIX_PLAN.md` item 1, ~15 min) must land first — content is invisible until `/stories` and the session flow render the real views.

---

## 1. New `src/lib/conjugate.ts` — light conjugation (pure, unit-tested)

Resolves inflected forms against the vocab dataset when longest-match fails. Turns `読んだ`, `なって`, `終わらせて`, `食べて` from bare kana into real word tokens.

- **Ending table** (longest-first): `なかった` / `ませんでした` / `ました` / `ません` / `ない` / `ます` / `たい` / `ても` / `ながら` / `たり` / `たら` / `そう` / `て` / `で` / `た` / `だ`
- **Sound-change rules** to reconstruct the dictionary form:
  - 未然形 (ない/なかった): `う→わ, く→か, ぐ→が, す→さ, つ→た, ぬ→な, ぶ→ば, む→ま, る→ら`
  - 連用形 (ます/ました): `う→い, く→き, ぐ→ぎ, す→し, つ→ち, ぬ→に, ぶ→び, む→み, る→り`; ichidan = drop `る`
  - て/た 音便: `〜んで/〜んだ` (む/ぶ/ぬ), `〜いて/〜いだ` (く/ぐ), `〜って/〜った` (つ/う/る)
- **Resolution:** strip ending → reverse sound change → look up dictionary form in the vocab index (by word, so kanji surface matches) → emit token with full reading (e.g. 読む `よむ` → 読んだ `よんだ`), meanings, level.
- **Unit tests:** verb × form table — 食べる, 読む, なる, 行く, 書く, 話す, 待つ, 遊ぶ, 泳ぐ, 買う, 飲む, 開ける, 終わる, 間に合う — every combination asserting the exact reading. Ambiguous cases (帰る vs 食べる) fall through to the existing kanji fallback — acceptable, documented.

## 2. Integrate into `tokenizer.ts`

- Call conjugation **after** the vocab longest-match, **before** the particle match (so `食べて` doesn't split into 食べ + particle て).
- Existing `OVERRIDES` stay as the first fast path (いらっしゃいませ, 六時, irregulars).
- **Risk check:** the tokenizer feeds listening distractors and quiz tokens — existing determinism tests must stay green; the "sharing ≥ 1" overlap test can only improve (more resolved words).

## 3. New `scripts/check-content.ts` — content lint

- Tokenizes every sentence in `stories.json` + `conversations.json`; fails on any bare/unresolved token (excluding punctuation).
- Also validates: unique ids, 3 options per choice turn, `correct` index in range, all choice turns have `why`.
- New npm script `content:check` (folded into `datasets:check`).

## 4. New content (N5, written against the lint script — zero bare tokens)

**5 stories** (6–8 sentences each, existing `{jp, en}` format):
1. 買い物 — supermarket shopping (買う, 〜てから)
2. 料理 — cooking dinner (〜ながら; keep grammar N5-safe)
3. 季節 — the four seasons (weather vocab, 〜になる)
4. 家族 — family introduction (い形容詞, 〜ています)
5. 電車で旅行 — a train trip (乗る, 〜まで, 〜たい)

**3 conversations** (existing format: あなた turns with 3 options + `why`, 6–9 turns):
1. レストランで — ordering, おすすめ, paying (お願いします, お会計)
2. 道を聞く — asking directions at a station (左/右/まっすぐ, ありがとう)
3. コンビニで — buying a drink + paying in coins (〜をください, お釣り)

Every new sentence verified through the lint script; leftover gaps (e.g. 六時-style set phrases) get a one-line override like the existing pattern.

## 5. Verification

- `npm test` — new conjugate tests + existing suite must pass
- `npm run lint`
- `npm run build`
- `npm run content:check` — zero flags
- Manual `/stories` + `/session` walk-through
- Update README feature counts (3→8 stories, 2→5 conversations)

**Not included** (per decision): N4 content, per-character furigana alignment — possible later phase.