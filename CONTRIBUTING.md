# Contributing to Nihongo Lab

## Installation

```bash
npm install
```

Node 20+ required. This is a standard Next.js app — no native builds beyond `better-sqlite3` (prebuilt binaries).

## Database setup

```bash
npx prisma migrate dev   # applies migrations and creates dev.db
```

`dev.db` is git-ignored; the schema lives in `prisma/schema.prisma` and migrations in `prisma/migrations/`. After changing the schema, run `npx prisma migrate dev --name <description>` and commit the generated migration.

## Development

```bash
npm run dev
```

Runs the app at `http://localhost:3000`. Client components live under `src/components`, pages under `src/app/**/page.tsx`, API routes under `src/app/api/**/route.ts`.

## Testing

```bash
npm test
```

Vitest. Tests cover the SRS scheduler, tokenizer, romaji converter, review service, and API route validation/generation. API tests use the real SQLite DB — they are written to be self-cleaning; if you see card counts grow locally, delete `dev.db` and re-migrate.

## Linting & types

```bash
npm run lint     # ESLint — must pass with zero errors
npx tsc --noEmit # TypeScript — must pass
```

Do not silence rules with `eslint-disable`, `@ts-ignore`, or `any` without a documented technical reason.

## Build

```bash
npm run build
```

Must pass before committing.

## Dataset updates

```bash
npm run datasets:check
```

Validates every bundled JSON file (required fields, unique keys) and prints bundle update dates. Refreshing the snapshots from OpenJLPT is a manual, validated workflow — full instructions are in `scripts/update-datasets.ts`. The EDRDG license requires a **monthly refresh** for web-facing deployment.

## Project structure

```text
src/
  app/            pages (server) + route handlers (API boundary)
  components/     client components (features + ui primitives)
  lib/            srs, tokenizer, romaji, tts, dates, datasets, db, api client
  generated/      Prisma client (generated, do not edit)
data/             bundled datasets (vocab, kanji, grammar, kana, stories, conversations)
prisma/           schema + migrations
scripts/          dataset validation/update tooling
docs/             architecture + production audit
```

## Coding conventions

- **Server/client separation**: datasets, Prisma, and fs never appear in client components. New dataset access goes through `src/lib/datasets.ts` (server-only, `react cache`).
- **API routes validate first**: parse params, return 400/404 JSON on bad input, never leak stack traces.
- **Deterministic generation**: any randomized content (quiz, listening) accepts a `seed` param and uses `src/lib/random.ts`.
- **State handling**: every data-driven page shows loading, empty, error, and success states.
- **No new UI dependencies**: use Tailwind, Framer Motion, Phosphor icons, and the existing `src/components/ui` primitives.
- **No fake functionality**: buttons must do what they say; stats/progress come from real data.
- Commit after meaningful milestones with clear messages; keep `CLAUDE.md` out of commits if you did not author its changes.