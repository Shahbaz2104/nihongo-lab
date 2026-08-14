# Nihongo Lab 日本語ラボ — Production Hardening, QA & Product Excellence

You are working on an existing Next.js application called **Nihongo Lab 日本語ラボ**, an offline-first Japanese learning platform.

The application is already substantially implemented. **Do NOT rebuild the project from scratch. Do NOT replace working architecture unnecessarily. Do NOT add random features just to increase feature count.**

Your job is to turn the existing implementation into a **stable, polished, production-quality Japanese learning platform**.

The priority is:

1. Understand the existing codebase.
2. Audit the implementation.
3. Find bugs and architectural weaknesses.
4. Fix correctness issues.
5. Improve the core learning experience.
6. Improve UX/UI and accessibility.
7. Strengthen tests.
8. Verify production builds.
9. Only then add carefully selected high-value features.

---

# 1. PROJECT CONTEXT

Nihongo Lab is an all-in-one Japanese learning platform.

Current major features include:

* Hiragana learning
* Katakana learning
* Kana recognition drills
* JLPT N5–N1 Kanji
* Kanji readings and meanings
* KanjiVG stroke-order animation
* Canvas kanji drawing practice
* 8,000+ vocabulary entries
* JLPT grammar
* Graded N5 reading stories
* Inline furigana
* Word hover tooltips
* Japanese → romaji conversion
* Web Speech API TTS
* Scripted conversation practice
* Multiple-choice quizzes
* SM-2 spaced repetition
* Review queues
* Review history
* Statistics
* Prisma + SQLite persistence

Current stack:

* Next.js 16
* App Router
* React 19
* TypeScript
* Tailwind CSS v4
* Framer Motion
* Phosphor Icons
* Prisma 7
* SQLite
* @prisma/adapter-better-sqlite3
* Recharts
* Vitest
* Web Speech API
* OpenJLPT datasets
* KanjiVG

Important project architecture:

```text
data/
prisma/
src/
  lib/
    srs.ts
    review-service.ts
    tokenizer.ts
    romaji.ts
    datasets.ts
    levels.ts
    tts.ts
    api.ts

  app/
    api/
      review/queue
      review
      quiz
      stats

    review/
    kana/
    kanji/
    vocab/
    grammar/
    quiz/
    stats/
    stories/

  components/
  components/ui/
```

---

# 2. CRITICAL RULES

Follow these rules throughout the entire task.

## Rule 1 — Inspect before modifying

First inspect:

* package.json
* prisma/schema.prisma
* prisma.config.ts
* all API routes
* src/lib/*
* all major pages
* all major components
* data structure
* existing tests
* Tailwind configuration/CSS
* Next.js configuration

Do not make assumptions about how the application works.

---

## Rule 2 — Preserve existing functionality

Do not replace working implementations unless there is a clear technical reason.

In particular, preserve:

* custom SM-2 implementation
* custom tokenizer
* custom kana → romaji converter
* Prisma architecture
* SQLite setup
* existing datasets
* Web Speech API
* KanjiVG integration

Improve them rather than replacing them.

---

## Rule 3 — No unnecessary dependencies

Before installing any package, ask:

> Can this be implemented cleanly with the existing stack?

Prefer the existing ecosystem.

Do not introduce MeCab, Kuromoji, large dictionary packages, or external AI services just to solve problems that can be handled locally.

---

## Rule 4 — Offline-first remains a core requirement

The application should continue working without external APIs wherever possible.

The following should work locally:

* Kana
* Vocabulary
* Kanji
* Grammar
* Stories
* Tokenization
* Romaji conversion
* SRS
* Quizzes
* Statistics
* Review

Network-dependent functionality should be clearly isolated.

---

## Rule 5 — Do not expose server-only code to the client

Pay particular attention to:

* Prisma
* node:fs
* dataset loaders
* filesystem access
* server-only utilities

Do not accidentally import server-only modules into client components.

---

## Rule 6 — Validate all user/API input

All API endpoints must safely validate:

* type
* JLPT level
* limit
* cardId
* grade
* quiz parameters

Reject invalid requests gracefully.

Do not trust query parameters.

---

## Rule 7 — Do not fake functionality

Do not create UI buttons that do nothing.

Every button should either:

* perform a real action,
* navigate somewhere meaningful,
* or clearly be marked as unavailable/planned.

---

# 3. PHASE 1 — COMPLETE CODEBASE AUDIT

Before changing anything, perform a complete audit.

Run:

```bash
npm install
npx prisma generate
npx prisma migrate dev
npm test
npm run lint
npm run build
```

If one command fails:

1. Investigate the root cause.
2. Document the issue.
3. Fix it.
4. Run the command again.

Do not simply suppress errors.

---

# 4. CREATE A PRIORITIZED AUDIT REPORT

Create:

```text
docs/PRODUCTION_AUDIT.md
```

Organize findings into:

## P0 — Critical

Examples:

* broken build
* runtime crashes
* incorrect SRS calculations
* corrupted database operations
* security problems
* broken API routes
* major data corruption

## P1 — Important

Examples:

* broken UI flows
* incorrect tokenizer output
* broken furigana
* TTS problems
* poor mobile behavior
* missing validation
* accessibility problems

## P2 — Improvements

Examples:

* animations
* minor UI polish
* better empty states
* performance improvements
* keyboard shortcuts

For every issue include:

```text
Issue
Location
Severity
Why it matters
Expected behavior
Current behavior
Recommended solution
```

---

# 5. PHASE 2 — FIX BUILD AND CODE QUALITY

The project must finish with:

```bash
npm run lint
```

passing.

And:

```bash
npm run build
```

passing.

Also run:

```bash
npx tsc --noEmit
```

There must be no TypeScript errors.

Do not disable ESLint rules merely to make the build pass.

Do not use:

```text
any
@ts-ignore
@ts-expect-error
eslint-disable
```

unless there is a documented technical reason.

---

# 6. PHASE 3 — SRS ENGINE AUDIT

The SRS engine is one of the most important technical components.

Inspect:

```text
src/lib/srs.ts
src/lib/review-service.ts
```

Verify the SM-2 behavior.

Expected behavior:

### New card

Initial:

```text
interval = 0
easeFactor = 2.5
repetitions = 0
lapses = 0
```

### Again

Should:

* reset interval appropriately
* increase lapse count
* preserve reasonable ease behavior
* schedule the card for review

### Hard

Should:

* increase repetitions appropriately
* produce slower interval growth
* decrease ease factor appropriately

### Good

Should:

* increase interval according to ease factor
* update repetitions
* maintain reasonable ease

### Easy

Should:

* produce the largest interval increase
* increase ease factor
* mark the card correctly

Ensure the minimum ease factor is respected.

Ensure due dates are deterministic.

---

# 7. SRS TEST SUITE

Expand tests to cover:

```text
new → again
new → hard
new → good
new → easy

good → good
good → hard
good → again
good → easy

hard → hard
easy → easy

multiple consecutive lapses
ease factor floor
interval growth
due date calculation
new card creation
review submission
```

Also test date boundaries.

Use deterministic dates rather than depending on the current system clock where possible.

---

# 8. REVIEW QUEUE AUDIT

Inspect:

```text
/api/review/queue
```

Verify:

1. Due cards appear first.
2. New cards fill remaining slots.
3. New cards are not duplicated.
4. Requested limits are respected.
5. Invalid types are rejected.
6. Invalid JLPT levels are rejected.
7. Review queues are deterministic enough for testing.
8. Cards from different categories behave correctly.

Test:

```text
vocab
kanji
kana
grammar
```

and:

```text
N5
N4
N3
N2
N1
```

---

# 9. PHASE 4 — TOKENIZER AUDIT

The tokenizer is one of Nihongo Lab's signature engineering features.

Inspect:

```text
src/lib/tokenizer.ts
```

Do not replace it with a large external tokenizer.

Improve the current architecture.

Current strategy:

```text
override dictionary
        ↓
longest vocabulary match
        ↓
particle fallback
        ↓
kanji fallback
        ↓
bare character
```

Create extensive tests.

Use examples such as:

```text
今日は学校へ行きました。

昨日東京に行ってきました。

日本語を勉強しています。

毎朝コーヒーを飲みます。

六時半に起きます。

彼女は本を読んでいます。

この本はおもしろくありません。

日本へ行きたいです。

一緒に映画を見ませんか。

食べられませんでした。
```

Verify each token contains:

```text
surface
reading
romaji
meaning
```

where appropriate.

---

# 10. TOKENIZER EDGE CASES

Test:

* polite verbs
* past tense
* negative forms
* て-form
* たい-form
* particles
* counters
* compound nouns
* kanji + hiragana
* katakana
* punctuation
* numbers
* dates
* time expressions
* unknown words
* repeated characters
* mixed English/Japanese
* whitespace
* quotation marks

Do not make the tokenizer claim more accuracy than it actually has.

If a limitation remains, document it.

---

# 11. PHASE 5 — ROMAJI ENGINE

Inspect:

```text
src/lib/romaji.ts
```

Test:

```text
こんにちは
がっこう
きょう
しゃしん
しゅくだい
ちょっと
スーパー
コーヒー
```

Verify:

* long vowels
* っ gemination
* ゃ ゅ ょ combinations
* ー
* particles such as は → wa
* へ → e

Add comprehensive unit tests.

---

# 12. PHASE 6 — STORY READER

This should become the flagship feature.

Improve:

```text
StoryReader
```

The experience should be:

```text
Japanese sentence
        ↓
hover word
        ↓
furigana
        ↓
reading
        ↓
romaji
        ↓
English meaning
```

Example:

```text
私は毎朝コーヒーを飲みます。
```

Hovering:

```text
飲みます
のみます
nomimasu
to drink
```

Add:

* hover tooltip
* keyboard accessibility
* click-to-open on mobile
* sentence TTS
* replay button
* slower playback
* hide/show furigana
* hide/show romaji
* save word
* add to review
* story progress
* story completion state

Do not break mobile interaction.

Hover does not exist on touch screens, so provide a touch-friendly interaction.

---

# 13. FURIGANA RENDERING

Audit the ruby rendering.

Use semantic HTML where appropriate:

```html
<ruby>
  日本語
  <rt>にほんご</rt>
</ruby>
```

Ensure:

* proper spacing
* no layout jumping
* readable ruby text
* correct wrapping
* mobile support
* dark mode support
* accessibility

Do not force ruby onto particles or punctuation unnecessarily.

---

# 14. PHASE 7 — TTS ENGINE

Inspect:

```text
src/lib/tts.ts
```

Improve browser compatibility.

Handle:

* Japanese voice detection
* missing Japanese voice
* speech cancellation
* repeated clicks
* queued speech
* line-by-line playback
* pause/resume if practical
* component unmount cleanup

Never assume:

```text
speechSynthesis.getVoices()
```

is immediately populated.

Handle the asynchronous voice loading behavior.

Provide graceful fallback when Japanese TTS is unavailable.

---

# 15. CONVERSATION PRACTICE

Improve the existing scripted conversation.

Each turn should provide:

```text
Japanese line
English meaning
audio
three choices
instant feedback
```

Correct answer should explain:

```text
Why this answer is natural
```

Incorrect answer should explain:

```text
Why it doesn't fit the situation
```

After completing the conversation, show:

```text
Score
Correct answers
Incorrect answers
Vocabulary encountered
Grammar encountered
Transcript
Replay conversation
```

---

# 16. PHASE 8 — KANJI EXPERIENCE

Audit:

```text
Kanji page
KanjiVG animation
KanjiDraw
```

Verify:

* stroke animation loads
* loading state
* failed network state
* correct kanji
* readings
* meanings
* drawing canvas
* clear button
* guide overlay
* responsive behavior

The drawing canvas should work on:

* mouse
* touch
* stylus where supported

Add an optional stroke-count indicator if the existing architecture supports it.

---

# 17. PHASE 9 — VOCABULARY

Improve vocabulary pages.

Each word should show:

```text
漢字
かな
romaji
English meaning
JLPT level
example sentence
furigana
audio
review button
```

For example:

```text
食べる
たべる
taberu
to eat
N5
```

Add:

```text
[ 🔊 Listen ]
[ + Review ]
```

Avoid unnecessary UI clutter.

---

# 18. PHASE 10 — GRAMMAR

Grammar entries should have:

```text
Grammar pattern
Meaning
Formation
Example
Furigana
Translation
Audio
JLPT level
Related patterns
```

Example:

```text
〜たい

Meaning:
want to...

Formation:
Verb stem + たい

Example:
日本へ行きたいです。
I want to go to Japan.
```

---

# 19. PHASE 11 — QUIZ ENGINE

Audit:

```text
/api/quiz
```

Ensure distractors are meaningful.

Avoid questions like:

```text
Correct: 食べる

Options:
食べる
食べる
食べる
飲む
```

Avoid duplicate options.

Ensure:

* exactly one correct answer
* valid distractors
* appropriate JLPT level
* balanced question types
* deterministic tests

Potential quiz types:

```text
Japanese → English
English → Japanese
Kanji → reading
Reading → kanji
Meaning → vocabulary
Grammar → meaning
```

---

# 20. PHASE 12 — DAILY LEARNING SESSION

After core stability is achieved, implement a lightweight daily learning flow.

Dashboard:

```text
Today's Japanese

Reviews        20
New vocabulary 10
Quiz           5
Reading        1 story
Conversation   1 session

[ Start today's session ]
```

The session should guide the user through a sequence:

```text
Review
 ↓
Vocabulary
 ↓
Reading
 ↓
Quiz
 ↓
Conversation
 ↓
Daily result
```

Do not make this overly complicated.

---

# 21. PHASE 13 — LISTENING PRACTICE

Use the existing TTS infrastructure.

Create a listening quiz mode.

Example:

```text
🔊 Listen

[ Play ]

What did you hear?

A. 日本の大学で勉強しています。
B. 日本の会社で働いています。
C. 日本の学校へ行きました。
```

Requirements:

* replay audio
* slower playback
* show answer
* track score
* connect encountered words to vocabulary
* respect JLPT level

Do not introduce an external speech API.

---

# 22. PHASE 14 — STATISTICS DASHBOARD

Create a meaningful learning dashboard.

Include:

```text
Today's reviews
Today's accuracy
Current streak
Cards due
Cards learned
Words learned
Kanji learned
Grammar learned
Stories completed
Total reviews
```

Add charts where useful.

Do not make charts purely decorative.

A learning-over-time chart should show actual historical data.

---

# 23. PROGRESS BY JLPT LEVEL

Show:

```text
N5
████████████████░░░░ 80%

N4
██████████░░░░░░░░░░ 50%

N3
████░░░░░░░░░░░░░░░░ 20%

N2
██░░░░░░░░░░░░░░░░░░ 10%

N1
░░░░░░░░░░░░░░░░░░░░ 0%
```

Use actual data.

Do not hardcode progress percentages.

---

# 24. PHASE 15 — UI/UX POLISH

Audit every page for:

* inconsistent spacing
* inconsistent typography
* inconsistent buttons
* broken responsive layouts
* unnecessary animations
* poor empty states
* missing loading states
* missing error states
* poor contrast
* inaccessible controls
* mobile issues

Create a consistent design system.

Use existing:

```text
Tailwind CSS
Framer Motion
Phosphor Icons
existing UI primitives
```

Do not introduce another component library.

---

# 25. RESPONSIVE DESIGN

Test at:

```text
320px
375px
390px
768px
1024px
1280px
1440px
```

Pay special attention to:

* story reader
* ruby text
* flashcards
* kanji canvas
* charts
* navigation
* conversation options
* tooltips

Mobile should feel intentionally designed, not like a desktop page squeezed onto a phone.

---

# 26. ACCESSIBILITY

Add:

* semantic HTML
* keyboard navigation
* visible focus states
* ARIA labels where appropriate
* accessible buttons
* accessible tooltips
* sufficient color contrast
* reduced motion support where appropriate

Important:

Do not make hover-only functionality inaccessible.

Story word information must also be available via keyboard/touch.

---

# 27. PERFORMANCE AUDIT

Look for:

* unnecessary client components
* unnecessary re-renders
* huge client-side datasets
* repeated dataset parsing
* unnecessary API requests
* expensive tokenizer operations
* unnecessary Prisma queries
* image/font problems
* oversized JavaScript bundles

Use server components where appropriate.

Keep server-only dataset loading server-side.

Cache static dataset processing when appropriate.

Do not prematurely optimize.

Measure first.

---

# 28. DATABASE AUDIT

Inspect:

```text
prisma/schema.prisma
```

Verify:

* indexes
* relationships
* unique constraints
* nullable fields
* timestamps
* cascade behavior
* review history
* card state

Make sure repeated requests cannot create duplicate cards unexpectedly.

---

# 29. API SECURITY & VALIDATION

Audit:

```text
/api/review/queue
/api/review
/api/quiz
/api/stats
```

For every route:

* validate parameters
* handle malformed JSON
* handle missing values
* handle invalid IDs
* return proper status codes
* avoid leaking internal errors
* avoid stack traces in production
* prevent invalid enum values

Example:

```text
GET /api/review/queue?type=invalid
```

must return a controlled error.

Do not crash.

---

# 30. ERROR HANDLING

Every major page should have sensible states:

```text
Loading
Empty
Error
Success
```

Example:

```text
Unable to load today's review.

[ Try again ]
```

Do not leave users staring at a blank screen.

---

# 31. DATA LICENSING

Create:

```text
/app/about/page.tsx
```

or another appropriate location.

Include attribution for:

* OpenJLPT
* JMdict
* KANJIDIC2
* Tatoeba
* KanjiVG

Include:

* source
* license
* dataset version
* update date

Keep licensing information accurate.

Do not invent licensing information.

---

# 32. DATA UPDATE PIPELINE

The project currently bundles datasets.

Create a maintainable update strategy.

Possible structure:

```text
scripts/
  update-datasets.ts
```

The script should:

1. Download approved upstream datasets.
2. Validate them.
3. Transform them into the project's expected format.
4. Generate/update JSON.
5. Report dataset versions.
6. Fail safely if data is malformed.

Do not automatically overwrite production data without validation.

If full automation is too risky, create a documented update workflow instead.

---

# 33. TESTING STRATEGY

Create tests for:

### Unit

```text
srs
tokenizer
romaji
dataset transformations
quiz generation
```

### API

```text
review queue
review submission
quiz
stats
```

### Integration

```text
create card
review card
update SRS
write ReviewLog
update DayStat
```

If the project has a suitable browser test setup, add a small number of end-to-end tests for:

```text
open app
start review
answer card
complete review
read story
play TTS
```

Do not introduce a huge testing framework unless necessary.

---

# 34. TEST DATA

Use deterministic fixtures.

Do not rely on random data in tests.

For quiz tests, seed predictable datasets.

For SRS tests, use fixed dates.

For API tests, use isolated database state.

---

# 35. DOCUMENT ENGINEERING DECISIONS

Create:

```text
docs/ARCHITECTURE.md
```

Explain:

## Why custom tokenizer?

Explain the offline-first requirement and longest-match strategy.

## Why custom romaji converter?

Explain control and dependency reduction.

## Why SM-2 from scratch?

Explain deterministic scheduling and educational value.

## Why Prisma + SQLite?

Explain local-first development and simple persistence.

## Why Web Speech API?

Explain no API key and browser-native Japanese TTS.

## Why Next.js App Router?

Explain server/client separation and application structure.

---

# 36. CREATE A CONTRIBUTING GUIDE

Create:

```text
CONTRIBUTING.md
```

Include:

```text
installation
database setup
development
testing
linting
build
dataset updates
project structure
coding conventions
```

---

# 37. IMPROVE THE README

The existing README is already strong.

Keep its useful technical details.

Add:

* screenshots
* architecture diagram
* feature overview
* setup
* testing
* deployment notes
* dataset attribution
* engineering decisions
* known limitations
* roadmap

The README should communicate that this is an actual engineering project, not just a UI demo.

---

# 38. DO NOT IMPLEMENT THESE YET

Do NOT immediately implement:

* AI tutor
* multi-user authentication
* social features
* leaderboards
* payments
* subscriptions
* complex gamification
* Anki import/export
* speech recognition
* huge external APIs

These belong after the core system is stable.

---

# 39. OPTIONAL ADVANCED FEATURES AFTER STABILITY

Only after all previous phases are complete, consider:

### AI conversation tutor

BYO API key.

Keep AI optional.

### Anki

```text
.apkg import
.apkg export
```

### Writing practice

Japanese text input with:

* kana
* kanji
* vocabulary
* grammar feedback

### Speech recognition

Japanese pronunciation practice.

### Adaptive curriculum

Use review history to recommend:

```text
weak vocabulary
weak kanji
weak grammar
appropriate stories
```

---

# 40. FINAL PRODUCT EXPERIENCE

The ideal home page should communicate:

```text
日本語ラボ

Learn Japanese through
reading, listening, practice,
and spaced repetition.

━━━━━━━━━━━━━━━━━━━━

Today's Japanese

🔥 7 day streak

20 reviews
10 new words
1 story
5 quiz questions

[ Start Learning ]

━━━━━━━━━━━━━━━━━━━━

Continue Learning

📖 N5 Story
☕ カフェで注文する

🗂 Review
18 cards due

漢字
N5 progress: 72%
```

The application should feel like a coherent learning platform rather than a collection of unrelated pages.

---

# 41. DEVELOPMENT PROCESS

Work incrementally.

For each phase:

1. Inspect.
2. Explain what you found.
3. Make the smallest appropriate changes.
4. Run tests.
5. Run lint.
6. Run TypeScript.
7. Run production build.
8. Review changed files.
9. Move to the next phase.

Do not make hundreds of unrelated changes in one pass.

---

# 42. GIT DISCIPLINE

Before starting:

```bash
git status
```

Do not overwrite unrelated user work.

After meaningful milestones, create commits such as:

```text
fix: stabilize production build
test: expand SRS coverage
fix: improve tokenizer edge cases
feat: improve story reader
fix: improve TTS sequencing
feat: add daily learning session
feat: improve learning statistics
fix: improve mobile accessibility
docs: add architecture documentation
```

Do not commit:

```text
.env
prisma/dev.db
node_modules
generated secrets
API keys
```

---

# 43. FINAL ACCEPTANCE CRITERIA

The project is considered complete only when:

## Build

```bash
npm run build
```

passes.

## TypeScript

```bash
npx tsc --noEmit
```

passes.

## Lint

```bash
npm run lint
```

passes.

## Tests

```bash
npm test
```

passes.

## Prisma

Database generation and migration work from a clean setup.

## SRS

Core scheduling behavior has strong automated coverage.

## Tokenizer

Common N5/N4 Japanese sentences tokenize correctly.

## Romaji

Kana conversion has comprehensive tests.

## Reading

Stories provide:

* furigana
* word information
* TTS
* mobile interaction

## Conversation

Scripted conversations work from start to finish.

## Kanji

Stroke animation and drawing work.

## Vocabulary

Vocabulary browsing and review integration work.

## Quiz

Questions contain valid, non-duplicate options.

## Statistics

Statistics are based on real database data.

## Mobile

Core functionality works on mobile widths.

## Accessibility

Core interactions are keyboard accessible.

## Documentation

Architecture and licensing are documented.

---

# 44. IMPORTANT: WORK ORDER

Follow this exact order:

```text
PHASE 1
Codebase audit
        ↓
PHASE 2
Build/type/lint stabilization
        ↓
PHASE 3
SRS correctness
        ↓
PHASE 4
Tokenizer + romaji correctness
        ↓
PHASE 5
Story reader + furigana
        ↓
PHASE 6
TTS + conversation
        ↓
PHASE 7
Kanji + vocabulary + grammar
        ↓
PHASE 8
Quiz + listening
        ↓
PHASE 9
Statistics + daily learning
        ↓
PHASE 10
UI/UX + accessibility + responsive
        ↓
PHASE 11
Performance + database + API audit
        ↓
PHASE 12
Dataset/licensing/update workflow
        ↓
PHASE 13
Documentation
        ↓
PHASE 14
Final QA
        ↓
PHASE 15
Production deployment preparation
```

---

# 45. MOST IMPORTANT INSTRUCTION

**Do not confuse "more features" with "better software."**

The goal is not to make Nihongo Lab enormous.

The goal is to make it:

* reliable
* accurate
* fast
* beautiful
* accessible
* offline-friendly
* technically defensible
* genuinely useful for Japanese learners

The final application should be something a developer can confidently show during a technical interview and explain:

> "I built the Japanese tokenizer myself, implemented the SM-2 scheduler myself, designed the review architecture, integrated KanjiVG, built the furigana reading engine, implemented browser-native TTS, and connected the learning data to a persistent review system."

Prioritize **engineering quality and learning experience over feature quantity**.

Start by auditing the existing repository. Do not begin by adding new features.

