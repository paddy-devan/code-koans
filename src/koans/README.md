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

## Current Vega Koan Schema

The runtime shape is defined in `src/koans/types.ts`.

A Vega koan includes:

- `id`: stable internal id, also used in route URLs
- `track`: currently always `"vega"`
- `slug`: readable slug, currently matching `id`
- `title`, `summary`, `instructions`
- `difficulty`: `"beginner"`, `"intermediate"`, or `"advanced"`
- `topic`: short grouping label such as `"marks"`, `"transforms"`, or `"signals"`
- `order`: unique display order within the Vega track
- `dataset`: rows injected into Vega as a dataset named `table`
- `startingSpec`: the editable learner starting point
- `targetSpec`: the chart shown in the target panel
- `checks`: deterministic validation rules

Keep koan definitions plain and explicit. Avoid helper abstractions until the repetition is clearly worse than the indirection.

## Runtime Dataset Rules

Every Vega spec is rendered through `buildRuntimeVegaSpec`.

That helper injects:

```ts
{ name: "table", values: koan.dataset }
```

Learner-defined `data` blocks are preserved, except for any learner block also named `table`. This means koans can ask learners to create derived datasets such as:

```ts
data: [
  {
    name: "filteredTable",
    source: "table",
    transform: [{ type: "filter", expr: "datum.value >= 7" }]
  }
]
```

Use `table` for the provided raw data. Use named derived datasets for transform koans.

## Validation Checks

The project now supports three validation styles.

### Legacy Spec-Shape Checks

These inspect the submitted Vega JSON directly. They are still supported for older koans, but should not be the default for new output-focused koans.

Available checks:

```ts
{ type: "marks-min-count"; expected: number; message: string }
{ type: "first-mark-type"; expected: string; message: string }
{ type: "first-mark-fill"; expected: string; message: string }
{ type: "x-domain-sort-order"; expected: "ascending" | "descending"; message: string }
{ type: "has-scale"; expected: string; message: string }
```

Use these only when the learning goal really is a specific Vega declaration.

### Scenegraph Checks

These render the Vega spec and inspect normalized scenegraph items. Prefer these when the learning goal is visible output.

Available checks:

```ts
{
  type: "markCount";
  expected: number;
  markType?: string;
  message: string;
}

{
  type: "markType";
  expected: string;
  message: string;
}

{
  type: "datumFieldValues";
  field: string;
  expected: Array<string | number | boolean>;
  markType?: string;
  ordered?: boolean;
  message: string;
}

{
  type: "relativePosition";
  field: string;
  expected: Array<string | number | boolean>;
  channel: "x" | "y";
  order?: "ascending" | "descending";
  markType?: string;
  tolerance?: number;
  message: string;
}

{
  type: "relativeSize";
  field: string;
  expected: Array<string | number | boolean>;
  measure: "width" | "height";
  order: "ascending" | "descending";
  markType?: string;
  tolerance?: number;
  message: string;
}
```

Current robust uses:

- simple vertical bar charts
- sorted bar charts
- simple scatterplots using `symbol` marks
- checking that expected source datum reached rendered marks
- checking relative positions and relative sizes

Current weak spots:

- line and area marks
- stacked marks
- facets and nested groups
- legends and axes
- text label placement beyond simple future text checks
- pixel-perfect visual equivalence

### Dataflow And Signal Checks

These inspect named runtime datasets and simple signal values from the running Vega `View`.

Available checks:

```ts
{
  type: "dataRowCount";
  dataName: string;
  expected: number;
  message: string;
}

{
  type: "dataFieldValues";
  dataName: string;
  field: string;
  expected: Array<string | number | boolean>;
  ordered?: boolean;
  message: string;
}

{
  type: "dataFieldOrder";
  dataName: string;
  field: string;
  expected: Array<string | number | boolean>;
  message: string;
}

{
  type: "signalValue";
  signalName: string;
  expected: string | number | boolean;
  message: string;
}
```

Use these for:

- filters
- formulas
- sorted derived data
- simple aggregate outputs once aggregate koans are added
- simple signal defaults

Do not use dataflow checks by themselves when the koan also needs to prove that the transformed data was visually encoded. Pair them with scenegraph checks where the rendered result matters.

## Check Recipes

### Basic Bar Chart

Use scenegraph checks:

```ts
checks: [
  {
    type: "markCount",
    expected: 3,
    markType: "rect",
    message: "Render three bar marks."
  },
  {
    type: "datumFieldValues",
    field: "category",
    expected: ["A", "B", "C"],
    markType: "rect",
    message: "Render a bar for each expected category."
  },
  {
    type: "relativeSize",
    field: "category",
    expected: ["B", "A", "C"],
    measure: "height",
    order: "descending",
    markType: "rect",
    message: "Encode values as relative bar heights."
  }
]
```

### Sorted Bar Chart

Use `relativePosition` when you care about visual order:

```ts
{
  type: "relativePosition",
  field: "category",
  expected: ["High", "Medium", "Low"],
  channel: "x",
  markType: "rect",
  message: "Place bars left-to-right by descending value."
}
```

### Simple Scatterplot

Use `symbol` marks and relative x/y checks:

```ts
checks: [
  {
    type: "markCount",
    expected: 3,
    markType: "symbol",
    message: "Render one point for each row."
  },
  {
    type: "relativePosition",
    field: "label",
    expected: ["A", "B", "C"],
    channel: "x",
    markType: "symbol",
    message: "Place points left-to-right by increasing x value."
  }
]
```

For y positions, remember that Vega screen coordinates increase downward. If larger data values should appear higher in the chart, use `order: "descending"` for rendered `y` positions.

### Filter Transform

Ask the learner to create a named derived dataset, then validate the data and rendered marks:

```ts
checks: [
  {
    type: "dataRowCount",
    dataName: "filteredTable",
    expected: 2,
    message: "Create a filteredTable dataset with two rows."
  },
  {
    type: "dataFieldValues",
    dataName: "filteredTable",
    field: "category",
    expected: ["Beta", "Gamma"],
    message: "Keep Beta and Gamma in the filtered dataset."
  },
  {
    type: "markCount",
    expected: 2,
    markType: "rect",
    message: "Render one bar for each filtered row."
  }
]
```

### Formula Transform

Validate the calculated field directly:

```ts
{
  type: "dataFieldValues",
  dataName: "doubledTable",
  field: "doubleValue",
  expected: [8, 14, 20],
  message: "Calculate doubleValue as twice the original value."
}
```

### Signal Default

Validate simple signal values:

```ts
{
  type: "signalValue",
  signalName: "threshold",
  expected: 7,
  message: "Set the threshold signal to 7."
}
```

This validates signal state, not browser event behavior.

## Fixture Test Pattern

Every new koan should be covered by validation tests in `src/validation/vegaValidation.test.ts`.

Minimum test coverage:

- the committed `targetSpec` passes
- at least one realistic incorrect submission fails the check that matters most

For a new check type, add both:

- a passing fixture that proves the intended correct case
- a failing fixture that proves the check catches the likely mistake

The existing tests already run every committed target spec through `validateVegaSpec`. When adding a koan, add one failure fixture if the koan introduces a new concept or a new way to use existing checks.

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
