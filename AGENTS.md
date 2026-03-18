## Project overview

This repository contains **Code Koans**, a task-based learning website for niche technical tools and languages.

The initial focus is **Vega koans** only.

The long-term product vision is a multi-track site with routes such as:

- `/vega`
- `/regex`

but only the **Vega** track should be implemented at first.

The learning model is discovery-based:
- each koan is designed to illuminate a specific concept
- the learner should discover the concept by solving the task
- answers should ultimately be evaluated by the **output produced**, not by inspecting whether the code matches a specific reference implementation

The product is inspired by:
- CheckIO
- programming koans
- keybr (for a neutral, utilitarian UI style)

---

## Stack

Use this stack unless explicitly told otherwise:

- React
- TypeScript
- Vite
- React Router
- Cloudflare Workers
- Cloudflare D1 later when persistence is added

The application should be primarily client-rendered and mostly static in nature, with small Worker endpoints only where needed.

Do not introduce heavy frameworks or unnecessary abstractions.

---

## Engineering philosophy

Prioritise:

- simplicity
- transparency
- explicit code structure
- minimal dependencies
- readable components
- small, reviewable changes

Avoid:

- over-engineering
- premature abstraction
- unnecessary state management libraries
- unnecessary backend complexity
- building large systems in one pass

This project is intentionally meant to remain understandable to a developer learning how React projects fit together.

---

## Working rules for the agent

1. **Do not build the whole system at once.**
2. Work only in **small, auditable checkpoints**.
3. Leave the application in a working state after each checkpoint.
4. Prefer placeholders when needed rather than speculative complexity.
5. Keep route structure and file structure straightforward.
6. Prefer plain data structures and local state before introducing more abstraction.
7. Do not add a library unless it clearly reduces complexity or provides core required functionality.
8. Preserve the possibility of supporting multiple tool tracks later, but do not over-generalise before needed.
9. Keep the UI neutral and utilitarian rather than decorative.
10. Favour correctness and maintainability over cleverness.

---

## Current product scope

### In scope now
- app shell
- route structure
- Vega landing page
- Vega koan browser page
- Vega koan page
- profile page
- static koan definitions in-repo
- target chart rendering
- editable Vega/Vega-Lite spec
- live preview
- simple submit/check flow
- local progress tracking at first
- later: Worker-backed persistence

### Out of scope for now
- Regex implementation
- admin CMS
- polished auth system
- advanced gamification
- large-scale analytics pipeline
- LLM hints
- full output-based validation engine beyond the current checkpoint plan

---

## Expected page types

There should only be a small number of reusable page templates:

- Home page
- Tool landing page
- Koan browser page
- Koan page
- Profile page

Pages should be driven by data where possible.

---

## Vega koan page expectations

A Vega koan page should eventually include:

- koan title
- short instructions
- target chart
- editable spec
- live preview
- submit/check button
- result panel
- optional dataset display
- reset option

At early checkpoints, some of these can be placeholders.

---

## Validation philosophy

Long term:
- validate based on visual/output behaviour

Early versions:
- placeholder spec-based checks are acceptable

Validation logic should be structured so it can later evolve from:
- simple code-shape checks

toward:
- rendered-output-based checks

Do not tightly couple the UI to one validation strategy.

---

## Data philosophy

Initially:
- keep koans in version-controlled files in the repo
- do not build a koan management backend

Progress tracking:
- local/browser-based first
- persistent storage later

---

## File and module design

Prefer small, explicit modules.

A good direction is:

- `pages/` for route-level screens
- `components/` for reusable UI
- `koans/` for koan definitions and types
- `validation/` for checker logic
- `lib/` for utilities
- `workers/` or equivalent later for edge API code

Avoid deeply nested abstractions unless clearly justified.

---

## Definition of done for each checkpoint

A checkpoint is only complete if:

1. the app runs locally
2. the relevant route/page works
3. existing functionality still works
4. the code remains understandable
5. the implementation matches the current checkpoint in `PLANS.md`
6. no large unrelated refactors were introduced

---

## How to approach work

Before changing code:
- check the current checkpoint in `PLANS.md`
- only implement the next small step
- avoid jumping ahead to later checkpoints

When making changes:
- keep them focused
- prefer incremental edits over large rewrites
- preserve placeholders if the full version belongs to a later checkpoint

When done:
- ensure the app is still runnable
- ensure the delivered work can be manually audited easily

---

## Notes for future contributors/agents

This repository is intentionally designed to be:
- minimal
- inspectable
- educational for the maintainer

Optimise for clarity over sophistication.