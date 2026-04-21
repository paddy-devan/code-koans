## Purpose

This file defines the checkpoint-based implementation plan for Code Koans.

The agent must work through these checkpoints in order.

Do not skip ahead unless explicitly instructed.

Each checkpoint should leave the app in a working, reviewable state.

---

# Checkpoint 1 — Project skeleton and routing

## Goal
Create the initial React/Vite application shell with routing and placeholder pages.

## Deliverables
- React + TypeScript + Vite project
- React Router configured
- global layout/navigation
- placeholder pages:
  - Home
  - Vega landing
  - Vega koan browser
  - Vega koan page
  - Profile

## Acceptance criteria
- app runs locally
- navigation works
- all listed routes render
- code structure is simple and readable

## Not in scope
- real koan data
- Vega rendering
- validation
- persistence

## Status
- not started

---

# Checkpoint 2 — Static koan data model

## Goal
Introduce a simple in-repo koan data structure for Vega.

## Deliverables
- `Koan` type definition
- 2–3 sample Vega koans stored in code/files
- koan browser page renders koan list from data
- koan detail page loads based on route param

## Acceptance criteria
- koan list is data-driven
- each koan page shows the correct title/instructions
- missing/unknown koan IDs are handled clearly

## Not in scope
- target chart rendering
- live editor
- validation

## Status
- not started

---

# Checkpoint 3 — Target chart rendering

## Goal
Render the target Vega chart for each koan.

## Deliverables
- chart rendering component
- target chart displayed on koan page
- koan data includes target spec and dataset

## Acceptance criteria
- sample koans render a target chart correctly
- chart errors are surfaced visibly

## Not in scope
- editable user spec
- live preview
- validation

## Status
- not started

---

# Checkpoint 4 — Interactive editor with live preview

## Goal
Allow the user to edit a Vega spec and see a live preview.

## Deliverables
- editor component
- user spec initialised from koan starting code
- live preview chart
- visible JSON/spec error handling

## Acceptance criteria
- user can edit the spec
- preview updates in response
- broken specs show clear errors

## Not in scope
- submit/check logic
- completion tracking

## Status
- not started

---

# Checkpoint 5 — Placeholder validation

## Goal
Add a basic submit/check flow using temporary spec-based checks.

## Deliverables
- submit/check button
- simple validator
- result panel showing passed/failed checks
- validation config attached to koan definitions

## Acceptance criteria
- user can submit the current solution
- checks run and display results
- validation logic is clearly separable from the UI

## Not in scope
- output-based validation
- persistence

## Status
- not started

---

# Checkpoint 6 — Local progress tracking

## Goal
Track koan completion locally in the browser.

## Deliverables
- local storage progress mechanism
- koan browser displays completion state
- completion survives refresh

## Acceptance criteria
- completed koans remain marked after refresh
- progress display is coherent on browser and koan pages

## Not in scope
- server persistence
- user accounts

## Status
- not started

---

# Checkpoint 7 — Koan page usability improvements

## Goal
Make the Vega koan page feel coherent and usable.

## Deliverables
- improved layout
- clearer distinction between target chart and user preview
- clearer instructions
- local draft persistence for the editable spec
- reset-to-starting-spec
- optional dataset viewer
- improved results panel

## Acceptance criteria
- koan page is easy to use
- in-progress spec edits survive refresh in the same browser
- user can recover from mistakes easily

## Not in scope
- backend persistence
- advanced validation

## Status
- not started

---

# Checkpoint 8 — Output-oriented validation v1

## Goal
Begin replacing spec-based validation with deterministic output-oriented validation.

## Deliverables
- validation layer that inspects rendered result
- support for a few output-based checks such as:
  - mark type
  - mark count
  - expected categories
  - simple expected values/order

## Acceptance criteria
- at least one sample koan is validated by rendered outcome rather than spec shape
- validation logic remains understandable and testable

## Not in scope
- full chart equivalence engine
- fuzzy visual matching
- LLM hints

## Status
- not started

---

# Checkpoint 9 — Worker-backed persistence

## Goal
Introduce minimal backend persistence using Cloudflare Workers, making the Worker the canonical source of persisted progress once available.

## Deliverables
- Worker API endpoints
- Cloudflare D1-backed store for progress and submission attempts
- store/load progress with the Worker as the primary persisted record
- store submission attempts
- frontend persistence layer or service boundary so UI code does not directly manage separate local and Worker persistence paths
- local storage retained as fallback/cache behavior
- local development instructions using local Worker/D1 development rather than requiring deployed remote infrastructure

## Acceptance criteria
- app still runs locally
- app can be run and exercised locally with a local Worker/D1 setup
- progress can be persisted through Worker endpoints and read back as the canonical stored state
- the UI does not duplicate persistence logic across separate local-only and Worker-specific codepaths
- architecture stays simple

## Not in scope
- backend draft-spec persistence
- full auth system
- analytics platform
- production hardening

## Status
- not started

---

# Checkpoint 10 — Profile page and basic stats

## Goal
Make the profile page useful.

## Deliverables
- completed koan count
- attempt count
- per-koan status summary
- placeholder user identity if needed

## Acceptance criteria
- profile page shows coherent tracked data
- stats match actual recorded progress/attempts

## Not in scope
- social features
- badges/gamification

## Status
- not started

---

# Checkpoint 11 — Koan authoring ergonomics

## Goal
Make it straightforward to add new Vega koans.

## Deliverables
- documented koan schema
- koan validation rules
- clear example koan
- documented process for adding a new koan

## Acceptance criteria
- adding a koan is low-friction
- koan files remain readable

## Not in scope
- CMS/admin UI

## Status
- completed

---

# Checkpoint 12 — Multi-track foundation

## Goal
Ensure the structure can support future tracks such as Regex.

## Deliverables
- explicit track/tool concept in routing/data
- Vega remains the only implemented track
- no unnecessary over-generalisation

## Acceptance criteria
- future `/regex` route shape is obvious
- current implementation remains simple

## Not in scope
- actual Regex implementation

## Status
- completed

---

# Checkpoint 13 — Worker production hosting

## Goal
Deploy the React app and Worker API as a single Cloudflare Worker-backed application.

## Branch
`checkpoint-13-worker-production-hosting`

## Deliverables
- Cloudflare Worker serves the Vite build output as static assets
- `/api/*` requests are handled by the Worker
- client-side routes use a single-page app fallback
- production deploy script
- local Worker development instructions
- generated Worker build output removed from source control if present

## Acceptance criteria
- app can be built and deployed to Cloudflare Workers
- deployed app serves static assets and API routes from the same Worker
- direct visits and refreshes work for client routes such as:
  - `/`
  - `/vega`
  - `/vega/koans`
  - `/vega/koans/bar-chart-basics`
  - `/profile`
- existing local development flow still works
- deployment steps are documented clearly

## Not in scope
- user authentication
- account-specific progress
- production auth hardening
- UI redesign

## Status
- completed

---

# Checkpoint 14 — User-scoped D1 schema

## Goal
Prepare the backend data model for real user accounts and account-specific progress.

## Branch
`checkpoint-14-user-scoped-d1`

## Deliverables
- D1 migration for user/account tables
- D1 migration for user-scoped progress
- D1 migration for user-scoped submission attempts
- D1 migration for session storage if sessions will be owned by the app
- backend data-access helpers for user-scoped progress reads/writes
- temporary development user path only if needed to keep endpoints testable before login exists

## Acceptance criteria
- migrations apply locally
- migrations are safe to apply remotely
- backend progress logic is structured around an explicit user identity
- existing app behavior remains runnable during the transition
- old anonymous/global tables are not destructively removed until the replacement path is proven

## Not in scope
- GitHub OAuth
- login UI
- local-to-account progress merge
- profile page redesign

## Status
- completed

---

# Checkpoint 15 — GitHub login

## Goal
Allow a user to sign in with GitHub and keep a server-backed session.

## Branch
`checkpoint-15-github-login`

## Deliverables
- GitHub OAuth login route
- GitHub OAuth callback route
- logout route
- `/api/me` endpoint
- secure HttpOnly session cookie
- user upsert logic in D1
- minimal signed-in/signed-out UI state
- documented required Cloudflare secrets

## Acceptance criteria
- user can start login from the app
- GitHub redirects back successfully
- app can identify the signed-in user after refresh
- logout clears the session
- unauthenticated API responses are clear and intentional
- secrets are not committed

## Not in scope
- account progress sync
- social profile features
- password auth
- multi-provider auth

## Status
- completed

---

# Checkpoint 16 — Account progress sync

## Goal
Make cross-device koan progress work for signed-in users.

## Branch
`checkpoint-16-account-progress-sync`

## Deliverables
- signed-in progress reads from D1 as the canonical source
- signed-in submissions write to D1
- anonymous users retain local storage fallback behavior
- frontend persistence boundary handles authenticated, anonymous, cached, and failed states clearly
- optional local progress merge after first login
- koan browser and koan page use the canonical progress snapshot when available

## Acceptance criteria
- completing a koan while signed in persists to D1
- the same account sees completion on another browser/device
- anonymous usage still works without login
- local storage remains a cache/fallback rather than a competing canonical store
- UI does not duplicate separate local-only and Worker-specific persistence logic

## Not in scope
- backend draft-spec persistence
- advanced conflict resolution
- analytics
- gamification

## Status
- completed

---

# Checkpoint 17 — Production polish

## Goal
Make the production account and deployment flow coherent enough to run publicly.

## Branch
`checkpoint-17-production-polish`

## Deliverables
- profile page reflects the signed-in account and real account progress
- clear signed-out state
- tighter API error responses
- same-origin API assumptions reviewed and CORS simplified where appropriate
- production smoke-test checklist
- deployment, migration, and secret-management documentation

## Acceptance criteria
- profile page shows real account identity and stats when signed in
- profile page is useful and clear when signed out
- production deploy steps can be followed from the repo docs
- Worker/D1 migration workflow is documented
- no unrelated UI redesign is mixed into production hardening

## Not in scope
- advanced user settings
- admin tools
- analytics platform
- full visual redesign

## Status
- completed

---

# Checkpoint 18 — Scenegraph validation foundation

## Goal
Replace the early rendered-summary validation path with a reusable scenegraph extraction layer.

## Branch
`vega-validation-engine`

## Deliverables
- validation-only Vega render helper
- normalized scenegraph item extraction
- scenegraph-oriented checks:
  - `markCount`
  - `markType`
  - `datumFieldValues`
  - `relativePosition`
  - `relativeSize`
- `bar-chart-basics` migrated to scenegraph checks
- validation fixtures for passing and failing bar chart submissions

## Acceptance criteria
- a visually correct alternative solution for `bar-chart-basics` passes
- wrong mark type fails
- missing category fails
- wrong category order fails when order matters
- wrong relative bar heights fail
- validation failures remain readable
- existing spec-shape checks continue to work for older koans

## Not in scope
- dataflow checks
- semantic chart helper APIs
- line, area, facet, or interaction checks
- pixel comparison
- LLM-assisted evaluation

## Status
- completed
