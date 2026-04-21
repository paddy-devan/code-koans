# Code Koans

Code Koans is a small learning site for practising technical tools through focused exercises.

The current track is **Vega**. Each koan gives you a target chart, a dataset, an editable Vega spec, and a live preview. The goal is to discover the important Vega idea by changing the spec until your output matches the task.

The long-term idea is to support other niche tools and languages, but the project is intentionally Vega-first for now.

## What You Can Do

- browse Vega koans
- edit Vega specs in the browser
- compare your live preview with a target chart
- submit your solution for deterministic validation
- track progress locally or, when signed in, across devices

The current koans cover basic bars, sorting, color encodings, filters, calculated fields, scatterplots, and simple signal-driven filtering.

## Tech Stack

- React
- TypeScript
- Vite
- React Router
- Vega
- Cloudflare Workers
- Cloudflare D1
- GitHub OAuth for sign-in

## Run Locally

Install dependencies:

```bash
npm install
```

Run the frontend dev server:

```bash
npm run dev
```

This starts the Vite app. If the Worker API is not running, progress falls back to browser local storage, so the koan UI remains usable.

Run tests:

```bash
npm test
```

Build the app:

```bash
npm run build
```

## Run With The Worker

To run the production-shaped app locally, with Cloudflare Workers serving the React assets and API routes:

```bash
npm run d1:migrate:local
npm run dev:worker
```

Local GitHub OAuth secrets, if needed, should live in `.dev.vars` and must not be committed.

Useful Worker commands:

```bash
npm run d1:migrate:local
npm run d1:migrate:remote
npm run deploy
```

## Validation Engine

The Vega track is built around output-oriented validation. The aim is not to check whether a learner wrote the same spec as the reference answer. The aim is to check whether the submitted spec produces the intended result.

At a high level:

```text
learner Vega spec
  -> inject koan dataset as "table"
  -> run Vega in a validation view
  -> inspect scenegraph, data outputs, and signals
  -> run focused checks
  -> return readable pass/fail results
```

The current engine can validate:

- rendered mark count and mark type
- whether rendered marks contain expected datum values
- relative visual position, such as left-to-right order
- relative visual size, such as bar-height order
- distinct rendered properties, such as category fill colors
- named data outputs from Vega transforms
- field values and row order in derived datasets
- simple signal default values

This is enough for beginner Vega koans involving:

- simple bar charts
- sorted bars
- basic color-by-category tasks
- simple scatterplots
- filter transforms
- formula transforms
- simple signal defaults

Current limitations:

- no general visual equivalence engine
- no pixel comparison
- no robust validation for line or area charts yet
- no facet or nested-group validation yet
- no stacked-chart validation yet
- no interaction simulation beyond checking signal values
- limited axis and legend validation
- no LLM-based pass/fail judging

The validation code lives in `src/validation/`. Koan definitions live in `src/koans/`.

For koan authoring details, see `src/koans/README.md`. For the longer validation roadmap, see `docs/vega-validation-engine.md`.

## Project Structure

```text
src/
  components/   reusable React components
  koans/        Vega koan definitions and authoring notes
  lib/          small client utilities
  pages/        route-level screens
  validation/   Vega validation engine and tests
workers/        Cloudflare Worker API
migrations/     D1 database migrations
docs/           planning and design notes
```

## Development Notes

This project is deliberately kept small and inspectable. Prefer straightforward React, explicit TypeScript types, small modules, and focused validation checks over broad abstractions.

For the implementation roadmap, see `PLANS.md`.
