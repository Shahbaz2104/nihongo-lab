# Fix Plan — Nihongo Lab

Date: 2026-08-17
Scope: all issues found during code review. Severity key: **P0** = broken feature, **P1** = correctness / security, **P2** = polish.

> **Resolution status (2026-08-30):** all items below are now fixed and verified
> (`npm test` 72/72, `npm run lint`, `npx tsc --noEmit`, `npm run build` all green).
> Note: item 5's "`src/middleware.ts`" recommendation was **superseded** — Next 16 renamed
> Middleware to Proxy; the auth check now lives in `src/proxy.ts` (named `proxy` export, Node runtime).

---

## 1. P0 — Restore story/conversation views (headline feature is a stub)

**File:** `src/components/StoryReader.tsx`

`StoryView` (line 114) and `ConversationView` (line 236) are fully implemented but never rendered — the tabs render literal `STORY VIEW STUB` / `CONVO VIEW STUB` divs (lines 541, 565). Regression introduced in commit `11b99e7`.

- Replace the stub divs with the real components:
  - `tab === "reading"` → `<StoryView story={stories[storyIdx]} />`
  - `tab === "conversation"` → `<ConversationView conversation={conversations[convIdx]} />`
- Guard empty arrays (render an empty state instead of crashing when `stories[0]` is undefined).
- Verify both `/stories` and the session flow (session steps 3 & 5) render real content.

## 2. P1 — Corrupted apostrophes

**File:** `src/components/Session.tsx` (lines 62, 176)

- `"Start today2019s session"` → `"Start today's session"`
- `"they2019ll show up once you review them"` → `"they'll show up once you review them"`
- Grep `\d{4}s` across `src/` to catch any sibling instances.

## 3. P1 — Transactional `submitReview`

**File:** `src/lib/review-service.ts` (lines 177-209)

`card.update` + `reviewLog.create` + `dayStat.upsert` are three separate awaits; a crash mid-way leaves stats inconsistent.

- Wrap all three writes in a single `db.$transaction([...])`.

## 4. P1 — "Again" re-queues the card today

**File:** `src/components/FlashcardReview.tsx`

Grading `again` currently moves on and the card isn't seen again until tomorrow (`status: 1` is never re-presented).

- On grade `again`, append the current card to the end of the working queue.
- Guard rails: max 2 re-queues per card per session, session length cap (e.g. 40) to prevent infinite loops.
- Update index / `done` / `ProgressBar` math accordingly.
- Server SRS behavior unchanged (still a 1-day interval — SM-2-correct).

## 5. P1 — Shared-secret auth on mutating routes

**Files:** new `src/middleware.ts`; README; audit doc

`POST /api/review` and `POST /api/cards` accept unauthenticated writes (anyone could grade cards / inflate stats on a public deploy).

- Require header `x-api-token` matching `process.env.API_TOKEN` on POST to `/api/review` and `/api/cards`; return 401 otherwise.
- In dev with no token set, allow (local friction-free).
- Check Next 16 middleware conventions in `node_modules/next/dist/docs/` before writing (per AGENTS.md).
- Document `API_TOKEN` in README + audit.

## 6. P2 — Vocab payload: annotate first example only

**File:** `src/app/vocab/page.tsx` (line 11)

The page ships ~8,300 words with *every* example annotated in the RSC payload, but the UI renders only `examples[0]` per word (`VocabBrowser.tsx:80`).

- Annotate only `examples[0]`; keep raw examples on the item for future use. Cuts the annotated payload roughly in half, no API change.

## 7. P2 — Listening route O(n²)

**File:** `src/app/api/listening/route.ts` (lines 52-57)

For each target, the route re-tokenizes ~640 sentences to build the distractor pool.

- Memoize `contentTokens` per level in a module-level map (one pass over the level's items), reused across targets.
- Preserve seeded determinism (existing tests cover this).

## 8. P2 — Kanji quiz dotted kunyomi

**File:** `src/app/api/quiz/route.ts` (lines 91-96)

`kr`-direction answers/distractors can contain dictionary-dotted readings (`た.べる`).

- Normalize kunyomi (strip `・` / `.`) exactly like the tokenizer does (`tokenizer.ts:322-324`).
- Add a unit test asserting no option contains `.` or `・`.

## 9. P2 — StrokeOrder: timeout + cache

**File:** `src/components/StrokeOrder.tsx`

KanjiVG fetch has no timeout — a stalled network leaves the skeleton forever.

- `AbortController` with ~10s timeout.
- Module-level `Map<string, string[]>` client cache keyed by character.
- Error state already exists.

## 10. P2 — Refresh `docs/PRODUCTION_AUDIT.md`

- Mark fixed: P0-1, P1-2, P1-3, P1-4, P1-6, P1-7, P1-9, P1-10 (P1-8 done in data + UI).
- Add new findings: StoryReader stub, `2019` text, non-transactional review, no re-queue on "again", auth gap, payload waste, O(n²) listening, dotted kunyomi.
- Update suggested work order; note the new Playwright smoke test.
- Note decision: queue auto-creates cards on fetch — leave as documented behavior.

## 11. Tests & verification

- **Playwright smoke** (new `playwright.config.ts` + `e2e/smoke.spec.ts`; one-time `npx playwright install chromium`):
  - `/stories`: no "STUB" text, story buttons switch content, `<rt>` furigana elements exist.
  - `/session`: start button label renders correctly (no `2019`), review step grades a card.
  - Auth: POST without token → 401; with token → 200.
- **Unit tests**: quiz kunyomi normalization; listening determinism still passes after cache change.
- Gates: `npm test`, `npm run lint`, `npm run build`, `npx playwright test`.