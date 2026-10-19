# Demo video — script and shot list

Target length **2:00–2:15**. Everything below is recorded against the live app, so no
local setup is needed.

**URL:** https://earlyjobs-mini-ats-blond.vercel.app

## Before you hit record

- Browser window at **1440×900**, zoom 100%, no bookmarks bar, no extensions visible.
- Open the app once first so the Vercel function is warm — the first request after
  idle takes a second or two longer.
- Close devtools. Hide the macOS dock (`⌥⌘D`).
- Record the browser window only, not the full desktop.
- Decide now whether you're narrating live or adding voiceover after. Voiceover is
  easier to keep tight; the timings below assume roughly 150 words/minute.

The numbers quoted in the narration are what the live app shows today. The two
"(30d)" tiles are relative to the current date and will drift slightly over the
coming weeks — glance at the screen and say what's there rather than reading the
script verbatim if they've changed.

---

## 0:00–0:22 — Dashboard

**Shot:** Land on `/`. Hold still for 2 seconds, then slowly scroll to the funnel.

> "This is a mini applicant tracking system — 68 candidates across 8 roles.
> The dashboard opens on the numbers a recruiter actually gets asked about:
> 45 active candidates, 26 applications in the last 30 days, and an average
> time-to-hire of 27 days."

**Shot:** Stop with the **Hiring funnel** panel filling the frame.

> "The funnel is the part I want to call out. It isn't counting where people
> sit right now — it counts everyone who has *ever* reached each stage. So the
> 32% offer-to-hire conversion stays honest even after someone moves on or
> gets rejected."

## 0:22–0:45 — Search and filtering

**Shot:** Click **Candidates** in the nav. Pause. Then type `kubernetes` into the
search box, slowly enough to see the list react.

> "Search spans names, emails, job titles, locations and skills in one box."

**Shot:** Let the count settle on *Showing 1–12 of 14 candidates*.

> "Fourteen people with Kubernetes experience."

**Shot:** Set **Filter by stage** to `Interview`, then **Sort candidates** to
`Highest rated`.

> "Stage, role and source stack on top of that, and all of it lives in the URL —
> so this view is a link I can paste to a hiring manager, and the back button
> does what you'd expect."

**Shot:** Briefly highlight the address bar so the query string is readable.

## 0:45–1:12 — Candidate detail

**Shot:** Click **Komal Banerjee**.

> "Each candidate has the full picture — application details, skills, notes
> from the hiring team."

**Shot:** Scroll to the **Timeline** panel on the right.

> "And a timeline. Every stage change is stored as its own immutable event, not
> just a status field that gets overwritten. That audit trail is what makes the
> funnel metrics on the dashboard trustworthy."

**Shot:** Scroll back to **Notes**. Type into the note box:
`Reference check cleared — ready for the offer conversation.` Click **Add note**.

> "Notes save straight away."

## 1:12–1:42 — Pipeline (the money shot)

**Shot:** Click **Pipeline** in the nav. Let all six columns render.

> "The pipeline is the same data as a Kanban board — all 68 candidates across
> six stages."

**Shot:** Drag a card from **Interview** to **Offer**. Move deliberately; a slow
drag reads much better on video than a fast one. Let the toast appear.

> "Dragging a card moves the candidate. The card lands instantly because the UI
> updates optimistically, but it's a real write — it hits the database and
> appends a stage event behind it."

**Shot:** Click that candidate's card to open their detail page, and point at the
new top entry in the **Timeline**.

> "There's the event it just wrote."

**Shot:** Navigate back to `/`.

> "And the dashboard picks it up."

## 1:42–2:05 — Adding a candidate

**Shot:** Go to **Candidates**, click **Add candidate**.

**Shot:** In the *Add a candidate* dialog, fill **Full name** `Riya Menon`,
**Email** `riya.menon@example.com`, **Current title** `Staff Engineer`,
**Skills** `TypeScript, Kubernetes`. Leave the rest on their defaults and submit.

> "Adding a candidate is validated on the server with the same schema the API
> routes use."

**Shot:** Open **Add candidate** again, enter any name with email
`komal.banerjee@example.com`, and set **Applying for** to `Senior Frontend
Engineer` — the role she's already on. Submit and let the inline error show.

> "And you can't apply the same person to the same role twice — that's a
> database constraint, not just a UI check."

## 2:05–2:15 — Close

**Shot:** Back to the dashboard, or a static frame of the repo README.

> "Next.js App Router and TypeScript end to end, Prisma over SQLite locally and
> Turso in production, deployed on Vercel. Repo and live link are in the
> description. Thanks for watching."

---

## If you want a 60-second cut instead

Keep only: dashboard funnel (0:00–0:15) → search `kubernetes` (0:15–0:28) →
pipeline drag plus the timeline entry it creates (0:28–0:50) → close (0:50–1:00).
That still covers all four things the brief asked for: candidates, stages,
search, metrics.

## Things worth not skipping

- **The drag.** It's the single most convincing shot. Give it room.
- **The timeline right after the drag.** This is what separates the project from
  a CRUD table — show cause and effect in the same breath.
- **The URL during filtering.** Cheap to show, and it signals the state model was
  thought about.

## Reset between takes

If you move cards around and want the original data back:

```bash
set -a && . ./.env.turso && set +a && npm run db:seed
```

Takes about 70 seconds against Turso.
