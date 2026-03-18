# Koans

This directory contains in-repo koan definitions.

Initially only **Vega koans** are implemented.

Koans should be stored in code or structured data files inside the repository, not managed through a CMS or database.

The goal is to keep koan authoring simple, version-controlled, and easy to review.

## Koan design principles

A koan should:

- illuminate one main concept
- be solvable through discovery
- have a clear success condition
- avoid unnecessary wording
- avoid multiple equally confusing interpretations
- use a dataset that makes incorrect solutions visibly fail

For Vega koans, the learner should primarily work by:
- inspecting the target chart
- experimenting with the spec
- iterating until the desired result is produced

## Current Vega koan schema

The current runtime shape is defined in `src/koans/types.ts`.

A Vega koan currently includes:

- `id`
- `slug`
- `title`
- `summary`
- `instructions`
- `difficulty`
- `topic`
- `order`
- `dataset`
- `startingSpec`
- `targetSpec`
- `checks`

The current TypeScript shape is:

```ts
export type VegaKoanDifficulty = "beginner" | "intermediate" | "advanced";

export type VegaDatum = Record<string, string | number>;

export type VegaKoanCheck =
  | {
      type: "marks-min-count";
      expected: number;
      message: string;
    }
  | {
      type: "first-mark-type";
      expected: string;
      message: string;
    }
  | {
      type: "first-mark-fill";
      expected: string;
      message: string;
    }
  | {
      type: "x-domain-sort-order";
      expected: "ascending" | "descending";
      message: string;
    }
  | {
      type: "has-scale";
      expected: string;
      message: string;
    }
  | {
      type: "rendered-mark-count";
      expected: number;
      message: string;
    }
  | {
      type: "rendered-mark-type";
      expected: string;
      message: string;
    }
  | {
      type: "rendered-x-domain";
      expected: Array<string | number>;
      message: string;
    };

export type VegaKoan = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  instructions: string;
  difficulty: VegaKoanDifficulty;
  topic: string;
  order: number;
  dataset: VegaDatum[];
  startingSpec: Record<string, unknown>;
  targetSpec: Record<string, unknown>;
  checks: VegaKoanCheck[];
};
```

Keep koan definitions plain and explicit. Avoid helper abstractions that make a single koan harder to read in isolation.

## Validation rules

The project currently supports two classes of validation:

### Spec-shape checks

These inspect the submitted Vega JSON directly.

Available checks:
- `marks-min-count`
- `first-mark-type`
- `first-mark-fill`
- `x-domain-sort-order`
- `has-scale`

These are useful when a koan is still in a simpler placeholder-validation phase.

### Rendered-output checks

These render the submitted Vega spec and inspect the deterministic output.

Available checks:
- `rendered-mark-count`
- `rendered-mark-type`
- `rendered-x-domain`

Prefer these when the intended behavior can be expressed by the actual rendered result rather than by one exact code shape.

Validation should stay understandable. Do not add broad or fuzzy “equivalence” logic inside a single koan definition.

## Clear example koan

`bar-chart-basics` in `src/koans/vegaKoans.ts` is the clearest current example because it uses:
- a small explicit dataset
- a simple starting spec
- a complete target spec
- rendered-output validation

A copyable example in the current style:

```ts
export const basicBarKoan: VegaKoan = {
  id: "bar-chart-basics",
  slug: "bar-chart-basics",
  title: "Bar Chart Basics",
  summary: "Build a simple bar chart from categorical data.",
  instructions:
    "Use the provided dataset to produce a bar chart with category labels along the horizontal axis and values encoded as bar height.",
  difficulty: "beginner",
  topic: "marks",
  order: 1,
  dataset: [
    { category: "A", value: 5 },
    { category: "B", value: 8 },
    { category: "C", value: 3 }
  ],
  startingSpec: {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width: 320,
    height: 200,
    padding: 8,
    scales: [
      {
        name: "xscale",
        type: "band",
        domain: { data: "table", field: "category" },
        range: "width",
        padding: 0.15
      },
      {
        name: "yscale",
        domain: { data: "table", field: "value" },
        nice: true,
        range: "height"
      }
    ],
    axes: [
      { orient: "bottom", scale: "xscale" },
      { orient: "left", scale: "yscale" }
    ],
    marks: []
  },
  targetSpec: {
    $schema: "https://vega.github.io/schema/vega/v5.json",
    width: 320,
    height: 200,
    padding: 8,
    scales: [
      {
        name: "xscale",
        type: "band",
        domain: { data: "table", field: "category" },
        range: "width",
        padding: 0.15
      },
      {
        name: "yscale",
        domain: { data: "table", field: "value" },
        nice: true,
        range: "height"
      }
    ],
    axes: [
      { orient: "bottom", scale: "xscale" },
      { orient: "left", scale: "yscale" }
    ],
    marks: [
      {
        type: "rect",
        from: { data: "table" },
        encode: {
          enter: {
            x: { scale: "xscale", field: "category" },
            width: { scale: "xscale", band: 1 },
            y: { scale: "yscale", field: "value" },
            y2: { scale: "yscale", value: 0 },
            fill: { value: "#0a5c83" }
          }
        }
      }
    ]
  },
  checks: [
    {
      type: "rendered-mark-count",
      expected: 3,
      message: "Render three bar marks for the three categories in the dataset."
    },
    {
      type: "rendered-mark-type",
      expected: "rect",
      message: "Render rect marks in the final chart output."
    },
    {
      type: "rendered-x-domain",
      expected: ["A", "B", "C"],
      message: "Preserve the expected category order in the rendered x-scale domain."
    }
  ]
};
```

## Process for adding a new koan

When adding a new koan:
1. Decide the single main concept it teaches.
2. Choose a dataset that exposes common mistakes.
3. Pick an `id` and `slug` that are stable and readable.
4. Add the koan object to `src/koans/vegaKoans.ts` and place it in the intended `order`.
5. Define a `targetSpec` that clearly shows the intended final output.
6. Define a `startingSpec` that is close enough to guide discovery, but incomplete enough to leave the intended concept for the learner to find.
7. Add `checks` that match the current validation stage.
8. Prefer rendered-output checks when the desired behavior can be expressed clearly that way.
9. Keep `instructions` concise and task-focused rather than tutorial-like.
10. Run the app and manually verify:
    - the koan appears in the browser page
    - the koan route loads correctly
    - the target chart renders
    - the starting spec renders or fails in an understandable way
    - the checks pass for a correct solution and fail for an incorrect one

## Practical guidance

- Keep datasets small enough to inspect directly in the dataset viewer.
- Prefer one concept per koan, especially for beginner koans.
- Keep the `startingSpec` readable; avoid large generated specs.
- If a koan only needs a simple structural requirement, a spec-shape check is acceptable.
- If the important outcome is what the learner sees, use rendered-output checks.
- Avoid adding checks that duplicate each other unless they catch meaningfully different mistakes.

## Future expansion

Later, this directory may include additional track-specific folders such as:

```text
src/koans/vega/
src/koans/regex/
```

The project should remain capable of supporting multiple tracks, but only Vega should be implemented initially.
