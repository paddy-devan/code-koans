# Vega Validation Engine Plan

## Purpose

The Vega track needs validation that checks what the learner produced, not whether their spec matches one reference answer.

The long-term goal is:

```text
learner spec -> Vega runtime -> rendered/data output -> focused checks -> useful feedback
```

The goal is not to build a perfect general-purpose Vega equivalence engine. The goal is to build a koan-specific validation engine with reusable checks that are strong enough for teaching.

This document describes the maturity ladder, implementation checkpoints, tests, authoring ergonomics, high-impact checks, supported visual types at each stage, and where LLM assistance may fit.

## Design Principles

- Validate output behavior before spec shape when possible.
- Prefer relative checks over exact pixel checks.
- Keep checks small and explicit.
- Make koan authoring readable.
- Keep failure messages useful to learners.
- Add support by solving real koan needs, not by guessing every future abstraction.
- Avoid pixel comparison until structured validation is not enough.
- Keep validation client-side for now because the app already renders Vega in the browser.

## Core Model

The engine should eventually follow this flow:

```text
1. Build runtime Vega spec with the koan dataset.
2. Parse the spec with Vega.
3. Create a validation-only Vega View.
4. Run the view.
5. Extract useful runtime output:
   - scenegraph items
   - named data outputs
   - signal values
6. Normalize that output into simple structures.
7. Run koan-defined checks.
8. Return pass/fail results with readable messages.
```

The current code already has a small version of this idea in `src/validation/vegaValidation.ts`.

## Maturity Ladder

### Level 0: Spec-Shape Checks

Checks inspect the submitted spec object directly.

Examples:

- first mark type is `rect`
- a scale named `xscale` exists
- the x-scale domain has a descending sort

Useful for:

- syntax-focused koans
- early scaffolding
- checks where the concept really is a specific Vega declaration

Can validate robustly:

- simple required mark declarations
- simple scale declarations
- simple sort declarations
- existence of expected top-level spec parts

Cannot validate robustly:

- visual equivalence
- alternative correct implementations
- transformed data output
- rendered geometry
- interactions

Status:

- already exists
- should remain available, but should stop being the default direction

### Level 1: Rendered Summary Checks

Checks render the spec and inspect a small summary of the result.

Current examples:

- rendered mark count
- rendered mark type
- rendered x-scale domain

Useful for:

- first output-oriented checks
- proving that validation can run Vega and inspect runtime output

Can validate robustly:

- basic bar chart mark count
- basic expected mark type
- simple category domain order

Cannot validate robustly:

- whether bars encode correct values
- relative bar heights
- scatterplot x/y correctness
- text label correctness
- grouped/faceted marks

Status:

- already partially exists
- should be replaced by a more general scenegraph extraction layer

### Level 2: Scenegraph Foundation

Flatten the Vega scenegraph into normalized visual items.

Example normalized item:

```ts
type SceneItem = {
  markType: string;
  role?: string;
  datum?: Record<string, unknown>;
  x?: number;
  y?: number;
  x2?: number;
  y2?: number;
  width?: number;
  height?: number;
  fill?: string;
  stroke?: string;
  text?: string;
  opacity?: number;
};
```

Initial checks:

- `markCount`
- `markType`
- `datumFieldValues`
- `relativePosition`
- `relativeSize`

Useful for:

- most beginner chart output checks
- bar charts
- simple scatterplots
- simple text labels
- checking rendered order and relative size

Can validate robustly:

- bar charts with expected categories
- sorted bars
- bars with correct relative heights
- scatterplots with expected point count
- simple labels with expected text values
- simple color-by-category checks

Cannot validate robustly:

- arbitrary visual equivalence
- complex lines/areas without special handling
- stacked charts
- facets/small multiples
- interactions
- axis/legend correctness beyond simple label existence

MVP production candidate:

- yes, if it supports the first meaningful Vega koan sequence

### Level 3: Dataflow Checks

Inspect named Vega datasets and signal values from the running `View`.

Examples:

- `view.data("table")`
- `view.data("aggregated")`
- `view.signal("selectedCategory")`
- `view.getState()`

Initial checks:

- `dataRowCount`
- `dataFieldValues`
- `dataFieldOrder`
- `signalValue`

Useful for:

- transform koans
- aggregate koans
- filter koans
- calculate/formula koans
- sort koans
- early interaction state checks

Can validate robustly:

- filters
- calculated fields
- aggregate output
- sorted transformed data
- simple signal defaults

Cannot validate robustly:

- whether transformed data is visually encoded correctly by itself
- complex interactions without state simulation
- arbitrary nested group data unless we deliberately support it

MVP production candidate:

- not required for the first MVP, but high priority soon after Level 2

### Level 4: Semantic Chart Checks

Add author-friendly checks for common chart patterns. These checks compile down to scenegraph/dataflow checks.

Example:

```ts
{
  type: "barChart",
  markType: "rect",
  categoryField: "category",
  valueField: "value",
  expectedCategories: ["A", "B", "C"],
  expectedValueOrder: ["B", "A", "C"]
}
```

Useful for:

- making koans easier to author
- avoiding repeated low-level check lists
- keeping validation readable

Can validate robustly:

- common bar charts
- common scatterplots
- common line charts after line support exists
- common text-label tasks

Cannot validate robustly:

- unusual Vega designs
- custom geometric layouts
- complex dashboards
- highly creative visuals

MVP production candidate:

- desirable, but not required for the first MVP if low-level checks remain readable

### Level 5: Interaction Checks

Run a spec, set signals or simulate limited state, run again, and inspect changes.

Examples:

```ts
view.signal("selectedCategory", "A");
await view.runAsync();
```

Checks:

- signal exists
- signal default value
- output changes after signal update
- selected item opacity/fill changes

Useful for:

- hover/click selection koans
- filtering by control state
- parameterized charts

Can validate robustly:

- simple signal-driven state changes
- deterministic interaction states

Cannot validate robustly:

- full browser event behavior
- drag/brush interactions without more infrastructure
- timing/animation behavior

MVP production candidate:

- no. This is post-MVP.

### Level 6: Visual Similarity / Pixel Checks

Render target and submitted chart to images and compare pixels or image features.

Useful for:

- final visual regression checks
- hard-to-structure visuals
- optional similarity scoring

Risks:

- brittle antialiasing differences
- font differences
- device pixel ratio differences
- hard-to-understand failure messages
- easy to reject valid alternative solutions

Can validate robustly:

- only tightly controlled visuals with stable rendering

Cannot validate robustly:

- broad learner submissions without careful tolerances

MVP production candidate:

- no.

## MVP Definition

The MVP validation engine for production should be Level 2 plus a small amount of Level 1 compatibility.

MVP means:

- validation runs the submitted Vega spec
- validation inspects rendered scenegraph output
- validation supports the first beginner Vega koans without brittle spec matching
- failure messages are understandable
- test fixtures cover passing and failing submissions
- old spec-shape checks still work for existing koans during migration

MVP check types:

- `markCount`
- `markType`
- `datumFieldValues`
- `relativePosition`
- `relativeSize`

MVP robust visual coverage:

- simple vertical bar charts
- sorted bar charts
- basic categorical color checks
- basic scatterplots if symbols are added
- simple text labels if text checks are added

MVP not robust yet:

- line charts
- area charts
- stacked charts
- facets/small multiples
- interactions
- legends/axes beyond simple domain/label checks
- pixel-perfect visual equivalence

## Implementation Checkpoints

### Checkpoint 18: Scenegraph Validation Foundation

Goal:

- Replace the current rendered summary path with a reusable scenegraph extraction layer.

Deliverables:

- `renderVegaForValidation`
- `extractSceneItems`
- normalized `SceneItem` type
- check result types
- checks:
  - `markCount`
  - `markType`
  - `datumFieldValues`
  - `relativePosition`
  - `relativeSize`
- migrate `bar-chart-basics` to the new checks
- tests with passing and failing specs

Acceptance criteria:

- a visually correct alternative solution for `bar-chart-basics` passes
- wrong mark type fails
- missing category fails
- wrong category order fails when order matters
- wrong relative bar heights fail
- validation failures are readable

Robust visual coverage after this checkpoint:

- simple bar charts
- sorted bar charts
- basic mark count/type tasks

Still weak:

- transforms
- lines/areas
- labels
- facets
- interactions

### Checkpoint 19: Dataflow Validation

Goal:

- Validate named data outputs and simple signals.

Deliverables:

- `dataRowCount`
- `dataFieldValues`
- `dataFieldOrder`
- `signalValue`
- transform-focused fixtures
- at least one koan using a dataflow check

Acceptance criteria:

- filter/aggregate/sort outputs can be validated without spec-shape checks
- named data check messages are clear

Robust visual/data coverage after this checkpoint:

- simple transforms
- filters
- aggregates
- calculated fields
- simple signal defaults

Still weak:

- nested group datasets
- interactive transitions
- visual mark geometry for line/area/facet cases

### Checkpoint 20: Authoring Ergonomics

Goal:

- Make checks easy to write and read in koan definitions.

Deliverables:

- documented check schema
- example check recipes
- optional semantic helpers for common charts
- validation fixture pattern for each koan

Acceptance criteria:

- a new beginner koan can be authored without touching engine code
- koan checks read like intended learning outcomes
- tests make it obvious what a correct and incorrect solution look like

Robust coverage after this checkpoint:

- beginner bar/scatter/transform koans should be straightforward to author

Still weak:

- unusual chart forms
- complex chart-level semantics

### Checkpoint 21: Scatterplot and Text Label Support

Goal:

- Expand scenegraph checks beyond bars.

Deliverables:

- symbol-specific helpers
- text value checks
- optional near/anchor checks for labels
- scatterplot fixture koans

Acceptance criteria:

- point count and expected point data can be validated
- simple text labels can be validated
- label checks avoid brittle exact pixel matching where possible

Robust coverage after this checkpoint:

- simple scatterplots
- simple labels
- point color/size basics

Still weak:

- line/area charts
- label collision/layout quality
- legends/axes

### Checkpoint 22: Line and Area Support

Goal:

- Handle marks where one scenegraph item may represent many data points.

Deliverables:

- line item inspection
- area item inspection
- point sequence/order checks
- line/area fixtures

Acceptance criteria:

- line charts can be checked for expected series/order
- area charts can be checked for expected mark presence and data backing

Robust coverage after this checkpoint:

- simple line charts
- simple area charts

Still weak:

- stacked areas
- multi-series charts
- exact path geometry

### Checkpoint 23: Facets and Groups

Goal:

- Validate simple nested/grouped views.

Deliverables:

- group traversal support
- group-level datum checks
- child mark checks within groups
- small multiple fixtures

Acceptance criteria:

- expected group count can be validated
- expected child marks per group can be validated
- group categories can be validated

Robust coverage after this checkpoint:

- simple faceted charts
- simple grouped mark layouts

Still weak:

- deeply nested custom layouts
- complex dashboards

### Checkpoint 24: Interaction Checks

Goal:

- Validate simple signal-driven behavior.

Deliverables:

- signal setup helper
- pre/post scenegraph comparisons
- simple signal fixtures

Acceptance criteria:

- a signal can be set and the rendered result can be rechecked
- simple selection/filter behavior can be validated

Robust coverage after this checkpoint:

- deterministic signal-driven interactions

Still weak:

- pointer event simulation
- brush/drag behavior
- animated transitions

## High-Impact Checks

These are the 20% of checks likely to cover 80% of beginner and intermediate koans.

### 1. Mark Count

Answers:

- did the expected number of visual marks render?

Examples:

- three bars
- five points
- one line
- three labels

### 2. Mark Type

Answers:

- did the learner render the right kind of visual primitive?

Examples:

- bars use `rect`
- scatterplot points use `symbol`
- labels use `text`

### 3. Datum Field Values

Answers:

- do rendered marks correspond to the expected data?

Examples:

- bars cover categories `A`, `B`, `C`
- points contain expected ids
- labels contain expected category names

### 4. Relative Position

Answers:

- are things visually ordered correctly?

Examples:

- `A` is left of `B`
- highest value is first after sorting
- dates increase from left to right

### 5. Relative Size

Answers:

- are values visually encoded in the right direction?

Examples:

- `B` bar is taller than `A`
- larger values make larger points
- zero-value bars have zero or near-zero height

### 6. Data Field Values

Answers:

- did the data transform produce expected values?

Examples:

- filter keeps expected rows
- aggregate produces expected totals
- calculated field exists with expected values

### 7. Text Values

Answers:

- did expected labels render?

Examples:

- labels show categories
- labels show values
- title text appears

### 8. Signal Value

Answers:

- does an interactive/default state exist?

Examples:

- default selected category
- parameter value
- toggle state

## Authoring Ergonomics

Koan checks should be readable and close to the learning goal.

Preferred low-level form:

```ts
checks: [
  {
    type: "markCount",
    markType: "rect",
    expected: 3,
    message: "Render one bar for each category."
  },
  {
    type: "datumFieldValues",
    markType: "rect",
    field: "category",
    expected: ["A", "B", "C"],
    message: "Render bars for categories A, B, and C."
  },
  {
    type: "relativeSize",
    markType: "rect",
    byField: "category",
    property: "height",
    order: ["B", "A", "C"],
    message: "Encode value as bar height."
  }
]
```

Possible semantic helper later:

```ts
checks: [
  barChartChecks({
    categoryField: "category",
    valueField: "value",
    categories: ["A", "B", "C"],
    valueOrder: ["B", "A", "C"]
  })
]
```

Rules for authors:

- use relative checks unless exact values matter
- make each message teach one concept
- prefer expected data/visual behavior over spec syntax
- do not check colors unless color is the lesson
- do not check axes/legends unless axes/legends are the lesson
- avoid more than 4-6 checks per beginner koan

## Test Strategy

Each validation check should have unit tests.

Each koan should have fixture tests:

- target spec passes
- one alternative correct spec passes
- common wrong solution fails
- invalid JSON/spec error is handled

Initial fixture set for `bar-chart-basics`:

- target spec passes
- rect bars with different fill pass
- no marks fails
- symbol marks fail
- only two categories fail
- wrong value encoding fails relative height check

Test levels:

### Unit Tests

Test check functions with normalized scene items.

Fast and deterministic.

### Integration Tests

Run real Vega specs through the validation pipeline.

Slower but proves extraction and rendering work.

### Koan Fixture Tests

Use real koan definitions and known solution specs.

Best signal for product correctness.

## Visual Coverage Table

| Maturity level | Robustly validates | Weak or unsupported |
| --- | --- | --- |
| Level 0 spec-shape | required spec parts, simple syntax | visual output, alternative solutions |
| Level 1 rendered summary | mark count/type, simple domains | geometry, values, labels, transforms |
| Level 2 scenegraph foundation | bars, sorted bars, simple scatter, relative geometry | line/area internals, facets, interactions |
| Level 3 dataflow | filters, aggregates, calculations, sorted data | visual encoding correctness by itself |
| Level 4 semantic helpers | common chart recipes | unusual custom Vega designs |
| Level 5 interactions | simple signal-driven states | pointer/brush/drag events |
| Level 6 pixel comparison | tightly controlled visual regression | broad learner equivalence |

## LLM-Assisted Evaluation

LLMs may help, but they should not be the primary judge for completing koans.

Good uses:

- explain failed validation checks in friendlier language
- suggest hints based on failed checks
- review new koan definitions for clarity
- propose validation checks for a new koan
- summarize why a submitted spec probably failed
- help authors generate fixture cases

Risky uses:

- deciding pass/fail directly
- comparing arbitrary visual outputs without deterministic checks
- inspecting learner code for a single expected implementation
- generating feedback that contradicts deterministic validation

Recommended policy:

```text
Deterministic engine decides pass/fail.
LLM may explain, hint, or assist authors.
```

Possible future flow:

```text
validation results -> LLM hint generator -> optional learner hint
```

The LLM should receive structured validation failures, not raw unrestricted authority.

Example:

```json
{
  "koanId": "bar-chart-basics",
  "failedChecks": [
    {
      "type": "relativeSize",
      "message": "Encode value as bar height.",
      "details": "Expected B > A > C by height."
    }
  ]
}
```

The LLM can turn that into a hint, but cannot override the result.

## Implementation Notes For Future LLM Agents

When building this engine:

1. Do not rewrite the whole validation system at once.
2. Keep current checks working while adding new checks.
3. Add one check type at a time.
4. Add tests before migrating many koans.
5. Use real Vega rendering for integration tests.
6. Normalize scenegraph items before writing checks.
7. Avoid exact pixel assertions unless the koan requires them.
8. Preserve clear learner-facing messages.
9. Keep React UI separate from validation logic.
10. Do not add a large validation DSL until repeated patterns prove it is needed.

Suggested file direction:

```text
src/validation/
  vegaValidation.ts
  scenegraph.ts
  checks/
    markCount.ts
    datumFieldValues.ts
    relativePosition.ts
    relativeSize.ts
  fixtures/
    barChartBasics.ts
```

The first implementation should keep files small and explicit. If a helper does not clearly reduce complexity, do not add it yet.

