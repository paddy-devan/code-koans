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
Render the target Vega/Vega-Lite chart for each koan.

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
Allow the user to edit a Vega/Vega-Lite spec and see a live preview.

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
- reset-to-starting-spec
- optional dataset viewer
- improved results panel

## Acceptance criteria
- koan page is easy to use
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
Introduce minimal backend persistence using Cloudflare Workers.

## Deliverables
- Worker API endpoints
- store/load progress
- store submission attempts
- local development instructions

## Acceptance criteria
- app still runs locally
- progress can be persisted through Worker endpoints
- architecture stays simple

## Not in scope
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
- not started

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
- not started