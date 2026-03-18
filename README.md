# Code Koans

Code Koans is a task-based learning website for niche technical tools and languages.

The initial focus is **Vega koans**: small, discovery-based exercises designed to help users build an intuitive understanding of Vega by solving tasks of increasing difficulty.

The first implementation is Vega only. If Vega-Lite is added later, it should be introduced as a separate track rather than bundled into the initial Vega work.

The broader long-term vision is a multi-track site with sections such as:

- Vega
- Regex
- other niche technical tools

## Product idea

Each koan is designed to illuminate a specific concept.

The learner is not primarily taught through explanation first. Instead, the koan should be structured so that solving it requires engaging with the intended concept.

Long term, solutions should be evaluated by the behaviour/output they produce rather than by whether the code matches one exact reference solution.

## Initial scope

Current focus:
- Vega landing page
- Vega koan browser
- Vega koan page
- profile page
- static in-repo koan definitions
- live Vega editing and preview
- simple validation
- progress tracking

When Worker-backed persistence is added later, it should become the canonical source of progress data, with browser local storage retained as fallback/cache behavior.

## Design principles

- simple and transparent code
- minimal dependencies
- neutral, utilitarian UI
- small number of reusable page types
- incremental development
- placeholder implementations are acceptable when they help keep scope controlled

## Stack

- React
- TypeScript
- Vite
- React Router
- Cloudflare Workers
- Cloudflare D1 later for persistence

## Running locally

Frontend only:

```bash
npm install
npm run dev
```

With local Worker and local D1:

1. Create a D1 database in Cloudflare and replace the placeholder `database_id` in `wrangler.jsonc`.
2. Apply the local migration:

```bash
npm run d1:migrate:local
```

3. Start the Worker locally:

```bash
npm run dev:worker
```

4. In a second terminal, start the frontend and point it at the local Worker:

```bash
VITE_API_BASE_URL=http://127.0.0.1:8787 npm run dev
```

If the Worker is not running, the app still falls back to browser local storage for progress caching so the frontend remains usable during development.

## Project structure

This will evolve, but the intended shape is roughly:

src/
  pages/
  components/
  koans/
  validation/
  lib/

## Development approach

Development is intentionally organised into checkpoints. See:
	•	AGENTS.md for repository-specific working rules
	•	PLANS.md for the current implementation roadmap

## Notes

This project is intentionally being kept understandable for a developer learning how a modern React application fits together. Readability and clarity are preferred over sophistication.
