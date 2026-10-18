# EarlyJobs — Mini Applicant Tracking System

A small but complete ATS for managing candidates through a hiring pipeline: search
and filter a talent pool, drag candidates between stages, and track funnel health
on a metrics dashboard. Every stage change is written to an immutable audit trail,
which is what makes the velocity and conversion metrics trustworthy.

Built with Next.js 16 (App Router), TypeScript, Prisma, and SQLite.

## Features

**Dashboard** — Active candidates, 30-day application and hire counts with
period-over-period deltas, average time to hire, a stage-by-stage funnel with
conversion rates, current stage distribution, an eight-week application trend,
source effectiveness, and a live activity feed.

**Candidates** — Full-text search across name, email, skills, job title, location,
and role, combined with stage / role / source filters, five sort orders, and
pagination. Filters are URL-driven, so any view is shareable and survives a reload.

**Pipeline** — A six-column Kanban board. Drag a candidate to a new column to move
their stage, with an optimistic UI update and a server-side write. The board is
operable by keyboard as well: focus a card, press <kbd>Space</kbd>, use the arrow
keys to cross columns, then <kbd>Space</kbd> to drop.

**Candidate detail** — Contact details, resume and LinkedIn links, rating, skills,
a chronological stage timeline, and team notes. Stage can also be changed here
through accessible buttons.

**Roles** — Requisitions with status, salary band, pipeline spread, and per-stage
counts. Open roles sort ahead of on-hold and closed ones.

**JSON API** — `GET /api/candidates` and `GET /api/metrics` expose the same query
and aggregation logic the UI uses.

## Data model

| Model | Purpose |
| --- | --- |
| `Job` | A requisition candidates apply to |
| `Candidate` | An applicant, always attached to exactly one job |
| `StageEvent` | Append-only record of every stage transition |
| `Note` | Free-text feedback from the hiring team |

Two deliberate choices are worth calling out:

`StageEvent` is append-only rather than a mutable status column. Counting distinct
`(candidate, stage)` pairs answers "how many candidates ever reached this stage",
which is the true funnel — a candidate who was rejected after an interview still
counts toward interviews reached. A single `stage` column could not express that.

`Candidate.skills` is a comma-separated string because SQLite has no array type.
The data layer parses it into `string[]` at the boundary, so callers never see the
storage format.

## Running locally

Requires Node 20 or newer.

```bash
npm install
cp .env.example .env
npm run db:migrate   # creates dev.db and applies migrations
npm run db:seed      # 8 roles and 68 candidates with a realistic funnel
npm run dev
```

The app runs at http://localhost:3000.

The seed is deterministic — it uses a fixed PRNG seed, so re-running it reproduces
exactly the same dataset. It clears existing data first, so treat it as a reset.

### Useful scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Generate the Prisma client and build for production |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:seed` | Reset and reseed demo data |
| `npm run db:studio` | Browse the database in Prisma Studio |

## Deployment

Serverless filesystems are ephemeral, so a SQLite *file* cannot persist on Vercel.
Production instead points at [Turso](https://turso.tech), which is SQLite served
over HTTP — the schema, migrations, and queries are unchanged, only the connection
URL differs.

`src/lib/prisma.ts` picks the connection automatically: if `TURSO_DATABASE_URL` is
set it connects there, otherwise it falls back to the local `DATABASE_URL` file.

Set these environment variables on the host:

| Variable | Value |
| --- | --- |
| `TURSO_DATABASE_URL` | `libsql://<your-db>.turso.io` |
| `TURSO_AUTH_TOKEN` | Token from `turso db tokens create` |
| `DATABASE_URL` | Same libSQL URL, used by `prisma migrate deploy` |

Then apply migrations and seed the remote database once:

```bash
npm run db:deploy
npm run db:seed
```

## Project structure

```
prisma/
  schema.prisma        Data model
  seed.ts              Deterministic demo dataset
src/
  app/
    page.tsx           Dashboard
    candidates/        List, search, and detail pages
    pipeline/          Kanban board
    jobs/              Requisitions
    api/               JSON endpoints
    actions.ts         Server actions (all writes)
  components/          UI primitives and feature components
  lib/
    data/              Query and aggregation layer
    stages.ts          Stage definitions and presentation metadata
    validation.ts      Zod schemas shared by every write path
```

## Notes on the implementation

All writes go through server actions in `src/app/actions.ts` and are validated with
Zod before touching the database, so the client cannot submit an invalid stage or a
malformed email even if it bypasses the form. Duplicate applications are rejected at
the action level and surfaced as a field error, backed by a
`@@unique([email, jobId])` constraint so the rule holds under concurrent writes.

Relative timestamps render inside a `<time>` element with `suppressHydrationWarning`,
since the server and client necessarily compute "2 hours ago" at slightly different
instants. The machine-readable `dateTime` attribute stays authoritative.
