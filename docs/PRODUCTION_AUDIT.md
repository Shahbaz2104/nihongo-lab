# Nihongo Lab — Production Audit

Date: 2026-08-14
Baseline: `be75e23` — all four gates pass (`npm test` 8/8, `npm run lint`, `npx tsc --noEmit`, `npm run build`).

> **Status (2026-08-30):** all P0/P1/P2 findings in this report have been resolved and verified.
> The StoryReader tab regression, corrupted apostrophes, non-transactional review write, missing
> "again" re-queue, mutating-route auth gap, vocab payload waste, listening O(n²), dotted kunyomi,
> and StrokeOrder timeout/cache issues documented in `docs/FIX_PLAN.md` are also now fixed. Gates:
> `npm test` 72/72, `npm run lint`, `npx tsc --noEmit`, `npm run build` (proxy auth registered) — all green.

Severity key: **P0** = crash/corruption, **P1** = broken flow / correctness / a11y, **P2** = polish.

---

## P0 — Critical

### P0-1. Kana review queue crashes with a unique-constraint violation when cards exist at another level

- **Location:** `src/lib/review-service.ts:70-114` (`getReviewQueue`), `src/app/api/review/queue/route.ts`
- **Why it matters:** Requesting `GET /api/review/queue?type=kana&level=N4` after kana cards were created at `N5` returns HTTP 500 and the review page fails to load. This is a guaranteed crash sequence for any user who browses kana at two levels.
- **Expected behavior:** The queue endpoint always returns cards or a controlled error — never a 500.
- **Current behavior:** `getReviewQueue` filters `existing` by `{ type, level }` (line 73), but `datasetEntries("kana")` ignores `level` and returns all 92 kana. Since the schema's unique constraint is `@@unique([type, sourceId])` (`prisma/schema.prisma:29`), `createMany` (line 108) attempts to insert rows whose `[type, sourceId]` already exist under another level → unique violation → thrown error.
- **Reproduction:** confirmed with a test that queues kana at N5 then N4. `db.card.createMany` threw `Unique constraint failed`.
- **Recommended fix:** kana is level-less. Query existing kana cards without the level filter (or filter `level: null`), and skip the `level` requirement for kana in the route. Prefer matching existing kana cards regardless of the `level` param.

---

## P1 — Important

### P1-2. API input validation gaps

- **Location:** `src/app/api/review/queue/route.ts:8`, `src/app/api/quiz/route.ts:9`, `src/app/api/review/route.ts:8`
- **Why it matters:** Malformed input must produce a controlled 4xx, not silent empty results or a 500.
- **Current behavior:**
  - `limit`/`n` use `Number(searchParams.get(...))` with `Math.min(50, x)` — a non-numeric value yields `NaN`, and `slice(0, NaN)` silently returns `[]`; negative values are also accepted.
  - `/api/review` calls `await req.json()` unguarded — malformed JSON body throws → 500.
  - `/api/review` with an unknown `cardId` → `submitReview` throws `"Card not found"` → 500 instead of 404.
- **Recommended fix:** explicit number parsing with `Number.isFinite` + range clamp and 400 responses; wrap `req.json()` in try/catch; catch "Card not found" and return 404.

### P1-3. Streak / day-stat timezone mismatch

- **Location:** `src/lib/review-service.ts:17-20` (`dayStart` uses **local** tz), `src/components/StatsDashboard.tsx:21` and `src/components/Overview.tsx:34` (`computeStreak` uses **UTC** via `toISOString()`), `src/app/api/stats/route.ts:8` (local)
- **Why it matters:** `DayStat.date` is a local-timezone day string, but the streak calculation compares against UTC day strings. For timezones east of UTC a review after midnight local time lands on the wrong UTC date, so streaks break/off-by-one and today's "reviews" totals can disagree with the chart.
- **Expected behavior:** All day boundaries use the same timezone (server local or, better, a single UTC or offset-consistent helper).
- **Recommended fix:** Extract one shared `dayKey(date)` utility (e.g. in `src/lib/dates.ts`), use it in `review-service`, `stats/route.ts`, and both streak computations; delete the duplicated `computeStreak`.

### P1-4. Story word tooltips are hover-only (no touch / keyboard access)

- **Location:** `src/components/HoverText.tsx`
- **Why it matters:** The headline reading feature is inaccessible on touch devices (no hover) and to keyboard users (tooltip is `pointer-events-none`, no `tabIndex`/focus/keys). CLAUDE.md requires touch + keyboard access to word info.
- **Current behavior:** Tooltip appears only via `group-hover/word:block`.
- **Recommended fix:** Make each word a focusable element (`tabIndex={0}`) that also opens the tooltip on `focus`/`onKeyDown` and on `onClick`/`onPointerUp` (tap), with `aria-describedby`/`role="tooltip"` semantics and dismissal (Escape / click elsewhere). Keep hover behavior for desktop.

### P1-5. Vocab/Kanji pages ship the full annotated dataset to the client

- **Location:** `src/app/vocab/page.tsx`, `src/app/kanji/page.tsx` → `VocabBrowser` / `KanjiBrowser`
- **Why it matters:** `/vocab` serializes ~8,300 words *and* ~14,300 tokenized example annotations into the RSC payload (multi-MB); `/kanji` serializes all ~2,400 kanji. Slow initial load on mobile, wasteful memory.
- **Current behavior:** all levels are computed and passed as a prop in one payload.
- **Recommended fix:** split into per-level chunks fetched lazily (a `/api/vocab?level=N5&page=` endpoint or dynamic import per level), and only annotate examples that are actually rendered (e.g. first example per row, or annotate on demand).

### P1-6. Double-submit on review grading

- **Location:** `src/components/FlashcardReview.tsx:77-90` (`grade`)
- **Why it matters:** The grade buttons are not disabled while the request is in flight; a fast double-click submits the same card twice → two `ReviewLog` rows, two `DayStat` increments, and the SM-2 state applied twice.
- **Recommended fix:** track `submitting` state; disable grade buttons (and ignore keyboard 1-4) until the POST settles.

### P1-7. Kanji draw canvas: no pointer capture, not HiDPI-aware

- **Location:** `src/components/KanjiDraw.tsx`
- **Why it matters:** `onPointerLeave` stops the stroke mid-draw when the pointer drifts off-canvas; on touch the finger under the pointer can't keep the stroke when moving outside. Retina displays render blurry strokes (canvas drawn at CSS size, not `devicePixelRatio`).
- **Recommended fix:** call `setPointerCapture` on `pointerdown` and release on `pointerup`; scale the canvas backing store by `devicePixelRatio` and scale coordinates accordingly.

### P1-8. Conversation practice lacks per-option explanations and a replayable transcript

- **Location:** `src/components/StoryReader.tsx` (`ConversationView`)
- **Why it matters:** CLAUDE.md requires feedback that explains *why* an answer is natural/unnatural, plus a final transcript with replay. Currently feedback is only "Correct!" / "the natural reply is X", and the end screen shows only a percentage.
- **Recommended fix:** add `why` text to choice data; after completion show correct/incorrect counts, encountered vocab/grammar lists, a full transcript with speak buttons, and a replay-all control.

### P1-9. Missing licensing / attribution page

- **Location:** n/a (no page exists)
- **Why it matters:** Datasets are CC BY-SA (OpenJLPT/JMdict/KANJIDIC2, Tatoeba) and KanjiVG CC BY-SA 3.0; the EDRDG license requires web-facing apps to refresh data monthly. Without attribution the app violates the licenses.
- **Recommended fix:** add `/about` (or similar) with per-source attribution, license, dataset version, and update date; add the EDRDG monthly-refresh note.

### P1-10. `SpeakButton` state updates and speech continue after unmount

- **Location:** `src/components/ui/SpeakButton.tsx:25`, `src/lib/tts.ts:31`
- **Why it matters:** `promise.finally(() => setPlaying(false))` can set state after unmount (navigation mid-playback); speech also keeps playing after leaving the page (no `speechSynthesis.cancel()` on unmount).
- **Recommended fix:** use a mounted ref / abort on unmount; cancel TTS in `tts.ts` via a module-level tracker or in the component cleanup.

---

## P2 — Improvements

### ~~P2-11. Quiz keyboard listener re-attached every render~~ (fixed)

- **Location:** `src/components/Quiz.tsx` — effect now has proper deps (`loading`, `done`, `picked`, `q`, `speakEnabled`); listener re-subscribes only when question or phase changes, and pick logic is inlined so no stale closures.

### P2-12. `computeStreak` duplicated

- **Location:** `Overview.tsx:31-43` and `StatsDashboard.tsx:18-30`. Extract to `src/lib/stats.ts` and share.

### P2-13. Queue route casts `type as "vocab"`

- **Location:** `src/app/api/review/queue/route.ts:17` — the `CardType` union is narrowed by hand. Have `getReviewQueue` accept `CardType` directly.

### P2-14. `ReviewLog` grows unbounded

- No retention/aggregation policy. Acceptable for single-user SQLite, but worth documenting; a weekly `DELETE` of logs older than 90 days keeps the DB small.

### P2-15. Kanji queue cards: `reading` is a comma-joined on+kun string

- **Location:** `src/lib/review-service.ts:41` — `FlashcardReview`/`SpeakButton` deliberately skip TTS for readings containing commas (`FlashcardReview.tsx:73`), so kanji cards speak the bare kanji. Fine, but the reading shown on reveal is noisy (e.g. "かん, あん"). Consider showing on/kun separately on the front side.

### P2-16. `StrokeOrder` fetch has no timeout and no cache

- **Location:** `src/components/StrokeOrder.tsx:30` — a stalled network leaves the skeleton forever. Add an abort/timeout; consider a tiny client cache keyed by character.

### P2-17. Empty-state text on `FlashcardReview` when queue is empty

- `queue.length === 0` renders "終了" with no explanation — acceptable, but an explicit "Nothing due — try another level" would be clearer.

### P2-18. No dataset update pipeline

- Per EDRDG monthly refresh requirement: add `scripts/update-datasets.ts` (download → validate → transform → report) or at minimum a documented manual workflow.

### P2-19. `public/` contains unused Next.js starter SVGs

- `file.svg`, `globe.svg`, `next.svg`, `vercel.svg`, `window.svg` are unused; remove.

---

## Verified good

- SM-2 scheduler (`src/lib/srs.ts`) is pure and unit-tested; ease floor, lapses, interval ramp, and deterministic due dates all correct.
- Tokenizer architecture (overrides → longest-match → particles → kanji fallback) is sound and offline-first.
- Romaji converter handles long vowels, gemination, yō-on correctly.
- Server/client separation is respected (no Prisma/fs imports in client components; datasets loaded via `react cache` server-side).
- Loading/empty/error states exist on the major pages (review, quiz, stats, vocab, kanji).
- Dark-mode-only design token system is consistent; focus-visible styles and reduced-motion support are in place.
- Grading flow (queue → POST → SM-2 → ReviewLog → DayStat) is correct for vocab/kanji/grammar at a single level.
- Quiz generation (`src/app/api/quiz/route.ts`) is validated, level-scoped, and now seeded-deterministic; distractor pools are deduped so options can never contain duplicates, and each question has exactly one correct answer.

---

## Suggested work order (after this report)

1. P0-1 kana queue fix + regression test (highest priority)
2. P1-2 API validation, P1-3 timezone helper, P1-6 double-submit guard
3. P1-4 touch/keyboard tooltips (headline feature)
4. P1-7 draw canvas, P1-10 TTS cleanup
5. P1-5 payload split, P1-8 conversation explanations, P1-9 attribution page
6. Expand test coverage: tokenizer, romaji, review-service, quiz generation (see `CLAUDE.md` phases 3–11)
