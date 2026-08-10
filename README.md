# Nihongo Lab 日本語ラボ

An all-in-one Japanese learning lab for serious self-study. Kana drills, JLPT kanji with
animated stroke order, an 8,000+ word vocabulary deck, grammar patterns, **graded reading
stories with word-by-word furigana**, interactive conversation practice, quizzes, and a
spaced-repetition review engine built on a from-scratch SM-2 implementation.

Built with real infrastructure in mind — a Prisma-backed SQLite database, a custom
morphology-light tokenizer, a kana→romaji converter, and a fully unit-tested SRS scheduler.

---

## Features

### 📖 Reading & Conversation *(the headline module)*
- **Graded stories** (N5) with per-word **furigana** rendered inline as ruby text.
- **Hover any word** for an instant tooltip: kanji form, kana reading, **romaji**, and the
  English meaning — no dictionary lookup required.
- **Conversation practice**: play the learner in a scripted café ordering / self-introduction
  dialogue. Pick your line from three natural options, get instant correct/incorrect feedback,
  and build a scored transcript you can replay with TTS audio.
- Every story line and conversation turn has **native Japanese TTS** (browser Web Speech API,
  no API key); transcripts can be replayed as a reliable line-by-line sequence.

### 🗂 Review — SM-2 spaced repetition
- Flashcards for **vocab / kanji / kana / grammar** at any JLPT level.
- A from-scratch **SM-2 scheduler** (`src/lib/srs.ts`) with ease factor, interval growth,
  lapses, and a due-date queue — fully unit tested.
- Grade `again / hard / good / easy`; new cards are auto-created from the datasets on demand.
- Cards carry example sentences; vocab example sentences get an auto-generated **furigana line**.

### 🔤 Kana
- Hiragana & katakana charts with romaji, plus a recognition drill with audio.

### 漢字 Kanji
- Browse all JLPT N5–N1 kanji with on/kun readings and English meanings.
- **Animated stroke order** rendered from KanjiVG SVG data.
- **Canvas draw-practice mode** with a ghosted guide overlay.

### 単語 Vocab
- 8,000+ JLPT words (N5–N1) with readings, meanings, and TTS.
- Kanji words display **inline furigana**.

### 文法 Grammar
- JLPT grammar points with meaning, formation rules, and example sentences.

### 🎯 Quiz
- Server-generated multiple-choice quizzes with distractor options.

### 📊 Stats
- Review history, today's accuracy, per-level card counts, and a learning-over-time chart.

---

## The reading engine (how hover-furigana works)

Because the app is fully offline-capable, there is **no MeCab/Kuromoji dependency**. Instead,
`src/lib/tokenizer.ts` segments Japanese text with a longest-match strategy:

1. A curated **override dictionary** of common inflected/polite forms
   (`行きました → いきました`, `六時 → ろくじ`, `日本語 → にほんご`, …) wins first.
2. Otherwise a **vocabulary index** built from the bundled OpenJLPT datasets matches the
   longest known word at each position (indexed by first character, buckets sorted by length).
3. Single-character **particles** (は, を, へ, が, …) fall back to a hand-tuned gloss map with
   context-correct romaji (`は → wa`, `へ → e`).
4. Unknown single kanji are resolved through the **kanji dataset** (kun-yomi first) so every
   kanji still gets a reading + meaning.
5. Everything else is emitted as a bare character (no tooltip).

Readings are converted to romaji by `src/lib/romaji.ts`, a hand-written converter that handles
long vowels (`ー`), gemination (`っ`), and yō-on (`きゃ → kya`, `しゃ → sha`, `しゅ → shu`).

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) · React 19 · TypeScript |
| Styling | Tailwind CSS v4 (CSS-first config) |
| Motion | Framer Motion |
| Icons | Phosphor Icons (`@phosphor-icons/react`) |
| DB / ORM | Prisma 7 + SQLite via `@prisma/adapter-better-sqlite3` |
| Charts | Recharts |
| Tests | Vitest |
| TTS | Web Speech API (`speechSynthesis`, Japanese voice, sequenced line playback) |
| Data | Bundled JSON from OpenJLPT / KanjiVG (see Licensing) |

---

## Project structure

```
data/                        Bundled dataset JSON (vocab/kanji/grammar per level, kana, stories, conversations)
prisma/
  schema.prisma              Card / ReviewLog / DayStat models
src/
  lib/
    srs.ts                   SM-2 scheduler (pure, unit-tested) — the review core
    review-service.ts        Queue building + review submission (creates cards, updates stats)
    tokenizer.ts             Japanese word segmentation (longest-match + overrides + particles + kanji fallback)
    romaji.ts                kana → romaji converter
    datasets.ts              Server-only dataset loaders (node:fs, React cache)
    levels.ts                Client-safe JLPT level constants
    tts.ts                   Web Speech API helper
    api.ts                   Client fetch helpers
  app/
    api/
      review/queue           GET  — due + new review queue for a type/level
      review                 POST — grade a card (SM-2 update + stats)
      quiz                   GET  — multiple-choice questions with distractors
      stats                  GET  — dashboard aggregate + history
    review/ kana/ kanji/ vocab/ grammar/ quiz/ stats/ stories/   UI pages
  components/                Client components (FlashcardReview, KanjiDraw, StoryReader, …)
  components/ui/             Shared UI primitives (Button, Modal, SegmentedControl, SpeakButton, …)
```

---

## Getting started

```bash
npm install
npx prisma generate          # generate the Prisma client (src/generated)
npx prisma migrate dev       # create + apply the SQLite schema (prisma/dev.db)
npm run dev                  # http://localhost:3000
```

> The SQLite database file is created at the project root (`dev.db`) and is git-ignored.
> Prisma 7 uses a driver adapter, so the database URL lives in `prisma.config.ts` rather
> than `.env`.

### Scripts

```bash
npm run dev       # development server (Turbopack)
npm run build     # production build + typecheck
npm run start     # serve the production build
npm run lint      # ESLint (Next.js + react-hooks v6 rules)
npm test          # Vitest unit tests
```

---

## How the SRS works

`src/lib/srs.ts` implements SM-2:

- **New cards** start with a 1-day interval on the first `good`.
- **Ease factor** starts at 2.5 and adjusts per grade
  (`again −0.20`, `hard −0.15`, `easy +0.15`, minimum 1.3).
- **Intervals**: `again` resets to 1d, `hard` and `good` grow by the ease factor,
  `easy` roughly doubles.
- A `hard`/`good`/`easy` answer is "correct"; `again` increments lapses.
- **Stats** (`DayStat`, `ReviewLog`) track reviews, new cards learned, and accuracy per day.

The queue endpoint (`/api/review/queue`) returns due cards first, then auto-creates new cards
from the dataset until the requested limit is met.

---

## API

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/review/queue?type=&level=&limit=` | GET | Review queue (`vocab`/`kanji`/`kana`/`grammar`, level `N5`–`N1`) |
| `/api/review` | POST | Submit `{ cardId, grade }` → SM-2 update + stats |
| `/api/quiz?type=&level=&n=` | GET | Quiz questions with options |
| `/api/stats` | GET | Dashboard stats + daily history |

---

## Data sources & licensing

Vocabulary, kanji, and grammar data are bundled from **[OpenJLPT](https://github.com/evanclan/OpenJLPT)**
(CC BY-SA 4.0), which derives from:

- **[JMdict](https://www.edrdg.org/jmdict/)** and **[KANJIDIC2](https://www.edrdg.org/wiki/KANJIDIC_Project.html)** —
  EDRDG (CC BY-SA 4.0). **The EDRDG license requires web-facing dictionary applications to
  refresh their data at least monthly.** Before deploying, re-download the OpenJLPT snapshots
  in `data/` on a monthly schedule and rebuild.
- **[Jonathan Waller's JLPT resources](https://www.tanos.co.uk/jlpt/)** (CC BY)
- **[Tatoeba](https://tatoeba.org)** example sentences (CC BY)

Stroke-order animations are rendered from **[KanjiVG](https://kanjivg.github.io/)** (CC BY-SA 3.0),
fetched at runtime from the KanjiVG GitHub repository (network required for that feature only).

Stories and conversation scripts are original, written for this project.

This project is for language-learning and portfolio purposes only.

---

## Roadmap

- AI conversation tutor (bring-your-own-key LLM) for open-ended dialogue
- Anki `.apkg` import/export
- Multi-user accounts with per-user scheduling
- Per-character furigana alignment (splitting whole-word readings across kanji runs)
- Daily streak + goal reminders
