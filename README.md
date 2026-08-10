# Nihongo Lab 日本語ラボ

An all-in-one Japanese learning lab. Kana drills, JLPT kanji with animated stroke order, vocabulary with native TTS audio, grammar patterns, quizzes, and a spaced-repetition review engine — all powered by an SM-2 algorithm implemented from scratch.

## Features

- **Review** — SM-2 spaced repetition flashcards (vocab / kanji / kana / grammar) with review intervals, ease factors, lapses, and a due-queue. The scheduler lives in `src/lib/srs.ts` and is fully unit-tested.
- **Kana** — hiragana & katakana charts plus a recognition drill with audio.
- **Kanji** — browse all JLPT N5–N1 kanji, animated stroke order (KanjiVG), on/kun readings, and a canvas draw-practice mode with guide overlay.
- **Vocab** — 8,000+ JLPT words with readings, meanings, and browser-native Japanese pronunciation (Web Speech API, no API key).
- **Grammar** — JLPT grammar points with formation rules and example sentences.
- **Quiz** — multiple-choice quizzes generated server-side with distractors.
- **Stats** — review history, streaks, accuracy, and per-level card counts.

## Tech stack

- Next.js 16 (App Router) · React 19 · TypeScript · Tailwind CSS v4 · Framer Motion
- Prisma 7 + SQLite (driver adapter: `@prisma/adapter-better-sqlite3`)
- Recharts for analytics
- Vitest for unit tests

## Getting started

```bash
npm install
npx prisma generate
npx prisma migrate dev   # creates prisma/dev.db
npm run dev
```

Tests:

```bash
npm test
```

## Data sources & licensing

Vocabulary, kanji, and grammar data are bundled from **[OpenJLPT](https://github.com/evanclan/OpenJLPT)** (CC BY-SA 4.0), which derives from:

- [JMdict](https://www.edrdg.org/jmdict/) and [KANJIDIC2](https://www.edrdg.org/wiki/KANJIDIC_Project.html) — EDRDG (CC BY-SA 4.0). **The EDRDG license requires web-facing dictionary apps to refresh their data at least monthly.**
- [Jonathan Waller's JLPT resources](https://www.tanos.co.uk/jlpt/) (CC BY)
- [Tatoeba](https://tatoeba.org) example sentences (CC BY)

Stroke-order animations are rendered from **[KanjiVG](https://kanjivg.github.io/)** (CC BY-SA 3.0), fetched at runtime from the KanjiVG GitHub repository.

This project is for language-learning and portfolio purposes only.
