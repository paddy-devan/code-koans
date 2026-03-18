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

## Initial Vega koan structure

A Vega koan should include, at minimum:

- `id`
- `tool`
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
- `completionCriteriaText`

A TypeScript type similar to the following is expected:

```ts
export type VegaKoan = {
  id: string
  tool: "vega"
  slug: string
  title: string
  summary: string
  instructions: string
  difficulty: "beginner" | "intermediate" | "advanced"
  topic: string
  order: number
  dataset: unknown
  startingSpec: object
  targetSpec: object
  checks: VegaKoanCheck[]
  completionCriteriaText?: string[]
}
```

The exact type may evolve, but koans should remain plain and explicit.

## Validation philosophy

### Early implementation

Early koans may use placeholder checks based on spec structure.

Examples:
- mark type is bar
- x encoding uses category
- y encoding uses value

### Long-term direction

The intended long-term approach is output-based validation.

Examples:
- expected mark count
- expected grouping
- expected sort order
- expected categories and values
- expected rendered structure

Koan definitions should therefore keep validation concerns separate from UI concerns.

## Example authoring shape

An example koan object might look like this:

```ts
export const basicBarKoan = {
  id: "vega-basic-bar-1",
  tool: "vega",
  slug: "basic-bar-chart",
  title: "Basic bar chart",
  summary: "Create a simple bar chart from the provided data.",
  instructions: "Replicate the target chart using the provided dataset.",
  difficulty: "beginner",
  topic: "marks-and-encoding",
  order: 1,
  dataset: [
    { category: "A", value: 10 },
    { category: "B", value: 20 },
    { category: "C", value: 30 }
  ],
  startingSpec: {},
  targetSpec: {},
  checks: [
    { type: "spec-field-equals", path: "mark", expected: "bar" }
  ],
  completionCriteriaText: [
    "Use bar marks",
    "Map category to x",
    "Map value to y"
  ]
}
```

This is illustrative only.

## Authoring guidance

When adding a new koan:
1. Decide the single main concept it teaches.
2. Choose a dataset that exposes common mistakes.
3. Define the target chart clearly.
4. Define the starting spec.
5. Add checks appropriate to the current validation stage.
6. Keep instructions concise.
7. Avoid adding multiple new concepts in one beginner koan.

## Future expansion

Later, this directory may include additional track-specific folders such as:

```text
src/koans/vega/
src/koans/regex/
```

The project should remain capable of supporting multiple tracks, but only Vega should be implemented initially.
