## 1. Context

I am a junior frontend developer building a portfolio project for the **German job
market**. This will be reviewed by German hiring managers and I will have to defend
every architectural decision in a technical interview (_Fachgespräch_).

That constraint drives everything below:

- **Explainability beats cleverness.** Simple, readable code wins over elegant abstractions.
- **Finished beats feature-rich.** A polished small scope beats a broad unfinished one.
- Accessibility, type safety, and tests are not optional extras — they are the point.

## 2. Product

**Handwerk CRM** — customer and job management for small German trade businesses
(electricians, plumbers, painters). Today they track this in Excel or on paper.

Core loop: a customer requests work → a quote is issued → the job is commissioned →
the work is completed → the invoice is paid.

**Out of scope for v1** (do not build, do not scaffold):
time tracking, real invoice PDF generation, e-invoicing (XRechnung), calendar sync,
multi-user teams, file uploads, email sending, mobile app, payment integration.

## 3. Stack

| Layer        | Choice                                           |
| ------------ | ------------------------------------------------ |
| Build        | Vite                                             |
| Framework    | React 18 + TypeScript (`strict: true`)           |
| Routing      | React Router v6                                  |
| Styling      | Tailwind CSS                                     |
| Components   | shadcn/ui                                        |
| Backend      | Supabase (Postgres, Auth, Row Level Security)    |
| Server state | TanStack Query                                   |
| Forms        | react-hook-form + zod                            |
| Unit tests   | Vitest + React Testing Library                   |
| E2E          | Playwright                                       |
| Quality      | ESLint, Prettier, TypeScript strict              |
| CI           | GitHub Actions (lint → typecheck → test → build) |
| Deploy       | Vercel or Netlify                                |

**Do not add any dependency not listed here without asking me first.**
No Redux, no state management library beyond TanStack Query + React state.

## 4. Data model

Postgres via Supabase. All tables have `id uuid primary key default gen_random_uuid()`
and `created_at timestamptz default now()`.

### `profiles`

Extends `auth.users`.

- `id uuid` → references `auth.users(id)`
- `firma_name text`
- `kleinunternehmer boolean default false` — §19 UStG, disables VAT
- `standard_mwst_satz numeric default 19`

### `kunden`

- `owner_id uuid` → `auth.users(id)`
- `typ text` — `'privat' | 'firma'`
- `firma_name text nullable` — required when `typ = 'firma'`
- `anrede text nullable` — `'Herr' | 'Frau' | 'Divers'`
- `vorname text`, `nachname text`
- `email text nullable`, `telefon text nullable`
- `strasse text`, `plz text`, `ort text`
- `notizen text nullable`

### `objekte`

The site or property where work happens. A customer may own several.

- `kunde_id uuid` → `kunden(id)` on delete cascade
- `bezeichnung text` — e.g. "Einfamilienhaus Hauptstraße"
- `strasse text`, `plz text`, `ort text`
- `notizen text nullable`

### `auftraege`

- `owner_id uuid`, `kunde_id uuid`, `objekt_id uuid nullable`
- `auftragsnummer text` — auto-generated, format `YYYY-0001`, sequential per user
- `titel text`, `beschreibung text nullable`
- `status text` — see state machine below
- `betrag_netto numeric`
- `mwst_satz numeric` — 19, 7, or 0
- `angebot_datum date nullable`
- `beauftragt_datum date nullable`
- `erledigt_datum date nullable`
- `bezahlt_datum date nullable`

### `notizen`

- `auftrag_id uuid` → `auftraege(id)` on delete cascade
- `text text`

### Row Level Security

**Every table gets RLS enabled**, with policies restricting all operations to rows
where the authenticated user is the owner (directly, or via the parent `kunden` /
`auftraege` row). Write the SQL migrations explicitly — do not rely on defaults.
This is a deliberate GDPR/DSGVO talking point; I need to be able to explain the
policies line by line.

## 5. Business logic

This is the heart of the project. Implement it as **pure, framework-free TypeScript
functions in `src/domain/`**, fully unit tested, with no React or Supabase imports.

### 5.1 Status state machine

```
angebot → beauftragt → erledigt → bezahlt
   ↓           ↓
abgelehnt   storniert
```

- `abgelehnt` and `storniert` are terminal.
- Forward transitions only. No skipping steps.
- One exception: an explicit `zurücksetzen` action can move a job back exactly one
  step, and must clear the timestamp of the step being undone.
- Export `canTransition(from: Status, to: Status): boolean` and
  `getAllowedTransitions(from: Status): Status[]`. The UI must only ever offer
  transitions this function permits — never hardcode buttons.
- Entering a status sets the matching `*_datum` to today if it is null.

### 5.2 Money and VAT

- `brutto = netto * (1 + mwst_satz / 100)`
- If the profile has `kleinunternehmer = true`, force `mwst_satz = 0` and display the
  note _"Kein Ausweis von Umsatzsteuer gemäß §19 UStG"_ on the job detail view.
- Store money as numeric; do all arithmetic in cents as integers internally to avoid
  float errors. Test this explicitly with values like 19.99 and 0.1 + 0.2.
- Format for display with `Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' })`
  → `1.234,56 €`.

### 5.3 Payment deadlines

- A job in status `erledigt` has `faellig_am = erledigt_datum + 14 days`.
- If today is past `faellig_am` and status is still `erledigt`, the job is **überfällig**.
- Export `isUeberfaellig(auftrag, today: Date): boolean`. Pass `today` as an argument —
  never call `new Date()` inside domain logic, so it stays testable.

### 5.4 Deletion rules

- A `Kunde` with at least one `Auftrag` cannot be hard-deleted. Show a clear German
  error explaining why, and offer to delete the jobs first.
- Deleting a `Kunde` cascades to their `Objekte`.

## 6. Screens

1. **Auth** — register and login (Supabase email + password). Protected route wrapper.
2. **Dashboard** — four KPI cards (offene Angebote, laufende Aufträge, überfällige
   Zahlungen, Umsatz laufender Monat) plus a list of overdue jobs.
3. **Kunden** — searchable list with a privat/firma filter; create and edit in a dialog.
4. **Kunde detail** — master data, their Objekte, and their full job history.
5. **Aufträge** — Kanban board with one column per status, drag and drop between
   columns. A toggle switches to a table view with filters (status, customer, date range).
6. **Auftrag detail** — edit fields, a vertical status timeline showing the dates
   reached so far, allowed status actions, and the notes thread.
7. **Einstellungen** — company data, Kleinunternehmer toggle, default VAT rate.

## 7. Non-functional requirements

These are what make the project worth showing. Treat them as acceptance criteria.

### Language and locale

- **The entire UI is in German.** Labels, buttons, validation messages, empty states,
  errors. Use correct domain vocabulary (Auftrag, Angebot, Rechnung, Kunde, Objekt).
- Dates as `dd.MM.yyyy`, currency as above, all via `Intl` — no manual formatting.
- Code, comments, commit messages, and variable names are in **English**.
  Domain nouns keep their German names (`auftrag`, `kunde`) — do not translate them.

### Accessibility (non-negotiable)

- Semantic HTML. Landmarks, headings in order, real `<button>` and `<label>` elements.
- Full keyboard operability. Visible focus states everywhere.
- The Kanban board **must have a keyboard alternative** to drag and drop — a status
  dropdown on each card. Drag and drop is an enhancement, never the only path.
- Contrast ≥ 4.5:1. Errors announced via `aria-live`. Dialogs trap focus and restore it.
- Add `@axe-core/react` in development and keep the console clean.

### UX polish

- Empty states with a call to action for every list, never a blank page.
- Loading skeletons, not spinners, for list views.
- Optimistic updates for status changes, with rollback on error.
- A React error boundary at the route level.
- Confirmation dialogs for destructive actions.

### Testing

- **Unit (Vitest):** the full status machine, VAT and money maths, overdue logic,
  Auftragsnummer generation. Aim for 100% coverage of `src/domain/`.
- **Component:** the customer form (validation), a Kanban card (status actions).
- **E2E (Playwright):** one happy path — register → create customer → create job →
  advance through all statuses to `bezahlt`. Plus one accessibility smoke test.
- Do not chase a coverage number elsewhere. Deep tests on logic, thin tests on UI.

## 8. Repository structure

```
src/
  domain/          pure business logic, no framework imports, fully tested
  lib/             supabase client, query client, formatters
  components/ui/   shadcn primitives
  components/      shared app components
  features/
    auth/
    kunden/
    auftraege/
    dashboard/
  routes/
  types/           generated Supabase types
supabase/migrations/
```

Feature-first, not type-first. Each feature folder holds its own components, hooks,
and queries.

## 9. How I want you to work

This matters as much as the code itself.

1. **Work in phases. Stop after each one and wait for my review.** Suggested order:
   scaffold + tooling + CI → Supabase schema, RLS, and types → auth and protected
   routes → domain logic with tests → Kunden CRUD → Aufträge table view → Kanban →
   dashboard → settings → a11y pass → README.
2. **Before writing code for a phase, state the plan and the key decisions in two or
   three sentences, and name the alternative you rejected and why.**
3. **After finishing a phase, explain the code to me as if I were an interviewer
   asking "why did you do it this way?"** Point out anything I would struggle to defend.
4. Never use `any`. If typing is hard, say so and explain the options.
5. Keep components under ~150 lines. Extract logic into hooks or `domain/`.
6. Small, focused commits with conventional commit messages in English.
7. Ask before adding any dependency, and before deviating from this spec.

## 10. README (final deliverable)

Write `README.md` covering: the problem and who has it, a screenshot or GIF, the live
demo link, local setup, the stack with a one-line justification each, and a section
**"Architekturentscheidungen"** documenting at least six decisions in the form
_decision → reasoning → trade-off_. Include the SPA-over-Next.js choice, the pure
domain layer, RLS for data isolation, integers-for-money, and the keyboard-accessible
Kanban.
