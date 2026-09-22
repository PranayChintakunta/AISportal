# Academy Admin — Implementation Plan

Goal: give the people running AI Academy their own admin section that mirrors the existing
AIS Admin, but scoped to Academy. "Events" becomes "Workshops", plus three new capabilities:
video recordings, quizzes, and managed resources.

Base branch: `academy`.

---

## 1. The core decision: what *is* a workshop?

Academy today (`src/lib/academy-data.ts`) is entirely mock data — no database models exist for
workshops, quizzes, resources, or recordings.

Meanwhile the `Event` model already has everything a workshop needs on the scheduling side:
title, description, location, start/end time, capacity, cover image, RSVPs, QR check-in,
attendance, publish/draft state, and a `programs: MembershipType[]` field that already includes
`AI_ACADEMY`.

**Recommendation: a workshop IS an Event tagged with `programs: [AI_ACADEMY]`.**

Academy-specific data (recording, quiz, notes) hangs off that Event in new satellite models.

Why this over a separate `Workshop` model:

- RSVP, QR check-in, attendance scanning, capacity and reminders all work on day one instead of
  being rebuilt and re-tested.
- Attendance is what gates the quiz ("watch the replay if you missed it"), and attendance
  already lives on `Event`. A separate model would need its own attendance pipeline.
- A workshop genuinely is an event — members RSVP to it and show up in person.
- The existing code already anticipates this. `src/app/academy/page.tsx` carries a TODO saying
  to filter by `Event.programs` containing `AI_ACADEMY`.

The tradeoff: Academy admins edit records that also surface in the main `/admin/events` list.
That is acceptable and arguably correct — Academy workshops *should* appear on the public events
calendar. Access control keeps Academy officers scoped to only their own workshops.

---

## 2. Schema additions (`prisma/schema.prisma`)

Four new models. No changes to `Event` itself.

```prisma
model WorkshopContent {
  id            String    @id @default(cuid())
  eventId       String    @unique
  event         Event     @relation(fields: [eventId], references: [id], onDelete: Cascade)

  recordingUrl        String?   // external link (YouTube/Vimeo/Drive) or R2 public URL
  recordingStorageKey String?   // set only when uploaded directly to R2
  recordingDurationS  Int?

  summary       String?   // shown under the video on the workshop page
  quizDueAt     DateTime?

  createdById   String
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
}

model Quiz {
  id                String   @id @default(cuid())
  workshopContentId String   @unique
  workshopContent   WorkshopContent @relation(fields: [workshopContentId], references: [id], onDelete: Cascade)

  questionsJson     Json     // QuizQuestion[] — same builder shape as applications
  passingScore      Int      @default(100)  // percent required to pass
  isPublished       Boolean  @default(false)

  attempts          QuizAttempt[]
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
}

model QuizAttempt {
  id          String   @id @default(cuid())
  quizId      String
  quiz        Quiz     @relation(fields: [quizId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  answersJson Json     // { [questionId]: selectedOptionIndex }
  score       Int      // percent
  passed      Boolean
  submittedAt DateTime @default(now())

  @@index([quizId, userId])
}

model AcademyResource {
  id          String   @id @default(cuid())
  title       String
  description String?
  category    String?           // "Getting Started", "Cheat Sheets", etc.
  href        String?           // external link
  fileId      String?           // OR an uploaded File record
  file        File?    @relation(fields: [fileId], references: [id])
  sortOrder   Int      @default(0)
  isPublished Boolean  @default(false)

  createdById String
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

Notes:

- `QuizAttempt` is deliberately **not** uniquely keyed on `(quizId, userId)` so retakes are
  possible. "Has this member passed?" is `attempts.some(a => a.passed)`.
- `AcademyResource` supports either an external link or an uploaded file, not both. Validation
  enforces exactly one.
- Back-relations must be added to `Event`, `User`, and `File`.

---

## 3. Access control

### Current state

`User.role` is the only thing enforced. `User.team` (which includes `AI_ACADEMY`) exists in the
schema and in the member-editor UI, **but is never persisted and never checked**:
`PATCH /api/admin/members/[id]/roles` reads `role` and `programs` from the body and silently
drops `team`. This is a pre-existing bug that must be fixed first or "academy officers" cannot
be identified at all.

### Target rule

Academy admin is available to:

| Who | Condition |
|---|---|
| Executives | `role === EXECUTIVE` |
| Directors | `role === DIRECTOR` |
| Academy officers | `role === OFFICER` **and** `team === AI_ACADEMY` |

New helper in `src/lib/roles.ts`, alongside the existing `canManageApplications` etc.:

```ts
export function canManageAcademy(role: UserRole, team: TEAM | null): boolean {
  if (role === "EXECUTIVE" || role === "DIRECTOR") return true;
  return role === "OFFICER" && team === "AI_ACADEMY";
}
```

`getAdminViewer()` in `src/lib/admin-access.ts` must start selecting `team` and expose
`canManageAcademy` on the viewer object, mirroring how `canReview` works today.

Enforcement points, matching the existing pattern:

1. `src/app/admin/academy/layout.tsx` — redirect if `!viewer.canManageAcademy`
2. Every academy server action — a local `authorizeAcademyUser()` guard
3. Every academy API route — via the `getAdminUser()` equivalent

Guardrail for officers: an Academy officer may only create/edit Events whose `programs` include
`AI_ACADEMY`, and may not publish (matching the existing rule where officers cannot publish or
edit published events). Directors and Executives publish.

---

## 4. Routes

Mirrors `src/app/admin/events/` structure.

| Route | Mirrors | Purpose |
|---|---|---|
| `/admin/academy` | — | redirect to `/admin/academy/workshops` |
| `/admin/academy/workshops` | `admin/events/page.tsx` | List with stat cards, Published / Drafts / Past |
| `/admin/academy/workshops/new` | `admin/events/new` | Create form + **video field** |
| `/admin/academy/workshops/[id]/edit` | `admin/events/[id]/edit` | Edit form + video field |
| `/admin/academy/workshops/[id]/quiz` | `admin/applications/new` | Quiz question builder |
| `/admin/academy/resources` | new | Resource list + add/edit/reorder |

RSVP, QR, and Scan are **not** duplicated — those rows link to the existing
`/admin/events/[id]/rsvps`, `/check-in`, `/scan` pages, which already work.

Stat cards on the workshops list, adapted from the events list:

| Card | Meaning |
|---|---|
| PUBLISHED | published academy events |
| DRAFTS | unpublished academy events |
| UPCOMING RSVPS | non-canceled RSVPs on future academy events |
| QUIZ COMPLETION | percent of attendees who have passed the quiz (replaces AVG CAPACITY) |

### Sidebar

`src/components/admin/admin-sidebar.tsx` currently hardcodes
`["Applications", "Events", "Members", "Exit"]` and filters to a reviewer subset.

Add `"Academy"` between Events and Members, visible only when `viewer.canManageAcademy`. The
nav-filtering logic needs to become capability-driven rather than the current two fixed lists.
`MobileAdminNav` needs the same entry.

---

## 5. The video recording field

Added to the existing workshop create/edit form — the other fields (title, description, times,
location, capacity, tags, cover photo) stay exactly as they are.

**Recommended: URL-first.** A "Recording" card in the form sidebar, next to Cover Photo, with a
URL input accepting YouTube, Vimeo, or Google Drive links, stored in
`WorkshopContent.recordingUrl`.

Direct video upload to R2 is possible but a meaningfully bigger lift: workshop recordings are
hundreds of megabytes to gigabytes, which exceeds what the current
`putObjectToR2`-through-a-server-action path can handle. It would need presigned multipart
uploads, a progress UI, and would incur real storage and egress cost. The existing
`@aws-sdk/s3-request-presigner` dependency means the groundwork is there if you want it later.

Suggested path: ship URL-first, treat upload as a follow-up. The schema above already reserves
`recordingStorageKey` so adding upload later is not a migration-breaking change.

---

## 6. Quiz builder

The application question builder is the model to copy, but it is **not currently reusable** — it
lives inline in `src/app/admin/applications/new/page.tsx` as roughly 180 lines of JSX plus
handlers, with no extracted component.

### Step 1 — extract

Pull the builder into `src/components/admin/question-builder.tsx`, generic over question shape,
preserving the existing behavior: add, remove (min 1), duplicate, reorder with ↑/↓ buttons,
option list editing with empty-option stripping, and `crypto.randomUUID()` ids.

Then refactor the applications create page to consume it. This is a pure refactor and should
land with no behavior change — worth verifying the applications flow still works before moving
on.

### Step 2 — extend for quizzes

Quizzes need one thing applications do not: a correct answer.

| | Application question | Quiz question |
|---|---|---|
| Text field | `label` | `prompt` |
| Types | TEXT, LONG_TEXT, DROPDOWN, CHECKBOX, FILE | MULTIPLE_CHOICE only (initially) |
| Correct answer | none | `correctIndex: number` |
| Answer key | question **label** | question **id** |

The existing mock `QuizQuestion` in `src/lib/academy-data.ts` is already
`{ id, prompt, options, correctIndex }` — keep that shape so the existing
`src/components/academy/quiz-form.tsx` renderer keeps working against real data.

In the builder, each option row gets a radio button marking it correct.

### Step 3 — server-side grading

Applications validate almost nothing server-side (`questions: z.any()`). Quizzes must do better,
because a client-graded quiz is trivially bypassed and this one gates attendance credit.

- Zod schema enforcing non-empty `prompt`, ≥2 options, and `correctIndex` within bounds
- `POST /api/academy/quizzes/[id]/attempt` grades on the server and writes a `QuizAttempt`
- `correctIndex` is **stripped** from the payload sent to the member-facing page

---

## 7. Resources

Straightforward CRUD replacing the `resources` array in `src/lib/academy-data.ts`:
list with reorder, add/edit modal (title, description, category, link or file), publish toggle.

---

## 8. Public academy pages

Last phase: swap `src/app/academy/page.tsx` and `src/app/academy/workshops/[id]/page.tsx` off
the mock imports and onto real queries.

Also worth fixing while here: quiz answers and video notes are currently client-only
(`localStorage` for notes, React state for quiz results), so nothing survives a refresh or
follows the member to another device. Quiz attempts move server-side as part of section 6.
Notes could follow the same path or stay local — separate decision.

Two unused components exist and should be either wired up or deleted:
`src/components/academy/workshop-card.tsx` and `src/components/academy/up-next-card.tsx`.

---

## 9. Suggested order

Each phase is independently reviewable and shippable.

| Phase | Work | Risk |
|---|---|---|
| 0 | Fix `team` persistence in the roles API; add `canManageAcademy`; expose `team` on viewer | Low — unblocks everything |
| 1 | Sidebar entry, `/admin/academy` route shell, layout guard | Low |
| 2 | Migration for the four models | Medium — review before applying |
| 3 | Workshops list + create/edit form with recording URL | Medium |
| 4 | Extract `question-builder.tsx`, refactor applications to use it | Medium — touches a working flow |
| 5 | Quiz builder, grading API, `QuizAttempt` | Medium |
| 6 | Resources CRUD | Low |
| 7 | Point public academy pages at real data, remove mocks | Medium |

Phases 0–3 deliver a usable Academy Admin with workshops and video. Quizzes and resources build
on top.

---

## 10. Open questions

1. Should Academy officers see **only** academy workshops in `/admin/events`, or is it fine that
   the two lists overlap?
2. Should a passed quiz mark attendance on the `Event` (granting credit for a missed workshop),
   or stay a separate record?
3. Retakes: unlimited, or capped?
4. Is `passingScore` per-quiz, or globally 100% as the current mock requires?
