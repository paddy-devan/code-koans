import { describe, expect, it } from "vitest";
import type { VegaKoan } from "../koans/types";
import { getVegaKoanById, orderedVegaKoans, vegaKoans } from "../koans/vegaKoans";
import { validateVegaSpec } from "./vegaValidation";

const barChartKoan = getVegaKoanById("bar-chart-basics");
const filterKoan = getVegaKoanById("filter-bars-by-value");
const scatterplotKoan = getVegaKoanById("scatterplot-basics");

function cloneSpec(spec: Record<string, unknown>) {
  return JSON.parse(JSON.stringify(spec)) as Record<string, unknown>;
}

function getFirstMark(spec: Record<string, unknown>) {
  const marks = spec.marks;

  if (!Array.isArray(marks) || typeof marks[0] !== "object" || marks[0] === null) {
    throw new Error("Fixture spec must have a first mark.");
  }

  return marks[0] as Record<string, unknown>;
}

describe("validateVegaSpec scenegraph checks", () => {
  it("passes a visually correct alternative bar chart solution", async () => {
    expect(barChartKoan).toBeDefined();

    const spec = cloneSpec(barChartKoan!.targetSpec);
    const firstMark = getFirstMark(spec);
    const encode = firstMark.encode as {
      enter: {
        fill: unknown;
      };
    };

    encode.enter.fill = { value: "#123456" };

    await expect(validateVegaSpec(barChartKoan!, spec)).resolves.toMatchObject({
      passed: true,
    });
  });

  it("fails when the rendered mark type is wrong", async () => {
    const spec = cloneSpec(barChartKoan!.targetSpec);
    const firstMark = getFirstMark(spec);

    firstMark.type = "symbol";

    const result = await validateVegaSpec(barChartKoan!, spec);

    expect(result.passed).toBe(false);
    expect(result.results.find((check) => check.message.includes("rect marks"))?.passed).toBe(false);
  });

  it("fails when an expected category is missing", async () => {
    const spec = cloneSpec(barChartKoan!.targetSpec);

    spec.marks = [
      {
        type: "rect",
        encode: {
          enter: {
            x: { value: 0 },
            y: { value: 40 },
            width: { value: 80 },
            height: { value: 100 },
          },
        },
      },
      {
        type: "rect",
        encode: {
          enter: {
            x: { value: 100 },
            y: { value: 20 },
            width: { value: 80 },
            height: { value: 120 },
          },
        },
      },
      {
        type: "rect",
        encode: {
          enter: {
            x: { value: 200 },
            y: { value: 80 },
            width: { value: 80 },
            height: { value: 60 },
          },
        },
      },
    ];

    const result = await validateVegaSpec(barChartKoan!, spec);

    expect(result.passed).toBe(false);
    expect(result.results.find((check) => check.message.includes("each expected category"))?.passed).toBe(
      false,
    );
  });

  it("fails when category order is visually wrong", async () => {
    const spec = cloneSpec(barChartKoan!.targetSpec);
    const firstMark = getFirstMark(spec);
    const encode = firstMark.encode as {
      enter: {
        x: unknown;
      };
    };

    encode.enter.x = {
      signal: "datum.category === 'A' ? 220 : datum.category === 'B' ? 120 : 20",
    };

    const result = await validateVegaSpec(barChartKoan!, spec);

    expect(result.passed).toBe(false);
    expect(result.results.find((check) => check.message.includes("left-to-right"))?.passed).toBe(
      false,
    );
  });

  it("fails when relative bar heights do not encode the values", async () => {
    const spec = cloneSpec(barChartKoan!.targetSpec);
    const firstMark = getFirstMark(spec);
    const encode = firstMark.encode as {
      enter: {
        y: unknown;
        y2: unknown;
      };
    };

    encode.enter.y = { value: 40 };
    encode.enter.y2 = { value: 160 };

    const result = await validateVegaSpec(barChartKoan!, spec);

    expect(result.passed).toBe(false);
    expect(result.results.find((check) => check.message.includes("relative bar heights"))?.passed).toBe(
      false,
    );
  });
});

describe("validateVegaSpec dataflow checks", () => {
  it("passes a transform-focused koan with the expected derived dataset", async () => {
    expect(filterKoan).toBeDefined();

    await expect(validateVegaSpec(filterKoan!, filterKoan!.targetSpec)).resolves.toMatchObject({
      passed: true,
    });
  });

  it("fails when the expected derived dataset is missing", async () => {
    const result = await validateVegaSpec(filterKoan!, filterKoan!.startingSpec);

    expect(result.passed).toBe(false);
    expect(result.results.find((check) => check.message.includes("filteredTable dataset"))?.passed).toBe(
      false,
    );
  });

  it("fails when the derived dataset has the wrong filtered rows", async () => {
    const spec = cloneSpec(filterKoan!.targetSpec);
    const data = spec.data as Array<{ transform: Array<Record<string, unknown>> }>;

    data[0].transform = [{ type: "filter", expr: "datum.value > 7" }];

    const result = await validateVegaSpec(filterKoan!, spec);

    expect(result.passed).toBe(false);
    expect(result.results.find((check) => check.message.includes("two rows"))?.passed).toBe(false);
    expect(result.results.find((check) => check.message.includes("Beta and Gamma"))?.passed).toBe(
      false,
    );
  });

  it("fails when derived data values are correct but ordered incorrectly", async () => {
    const spec = cloneSpec(filterKoan!.targetSpec);
    const data = spec.data as Array<{ transform: Array<Record<string, unknown>> }>;

    data[0].transform = [
      { type: "filter", expr: "datum.value >= 7" },
      { type: "collect", sort: { field: "value", order: "descending" } },
    ];

    const result = await validateVegaSpec(filterKoan!, spec);

    expect(result.passed).toBe(false);
    expect(result.results.find((check) => check.message.includes("Beta and Gamma"))?.passed).toBe(
      true,
    );
    expect(result.results.find((check) => check.message.includes("original order"))?.passed).toBe(
      false,
    );
  });

  it("can validate a simple runtime signal value", async () => {
    const signalKoan: VegaKoan = {
      id: "signal-fixture",
      track: "vega",
      slug: "signal-fixture",
      title: "Signal Fixture",
      summary: "Fixture",
      instructions: "Fixture",
      difficulty: "beginner",
      topic: "signals",
      order: 999,
      dataset: [],
      startingSpec: {},
      targetSpec: {},
      checks: [
        {
          type: "signalValue",
          signalName: "threshold",
          expected: 7,
          message: "Expose the expected signal value.",
        },
      ],
    };

    const result = await validateVegaSpec(signalKoan, {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      width: 100,
      height: 100,
      signals: [{ name: "threshold", value: 7 }],
      marks: [],
    });

    expect(result).toMatchObject({ passed: true });
  });
});

describe("committed Vega koan targets", () => {
  it("keeps committed koan ids, slugs, and order values unique", () => {
    const ids = vegaKoans.map((koan) => koan.id);
    const slugs = vegaKoans.map((koan) => koan.slug);
    const orders = vegaKoans.map((koan) => koan.order);

    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(new Set(orders).size).toBe(orders.length);
  });

  it("exposes koans in ascending order", () => {
    expect(orderedVegaKoans.map((koan) => koan.id)).toEqual([
      "bar-chart-basics",
      "sort-bars-descending",
      "color-by-category",
      "filter-bars-by-value",
      "scatterplot-basics",
      "calculate-derived-values",
      "signal-threshold-filter",
    ]);
  });

  it.each(vegaKoans)("passes the target spec for $id", async (koan) => {
    await expect(validateVegaSpec(koan, koan.targetSpec)).resolves.toMatchObject({
      passed: true,
    });
  });

  it("fails scatterplot validation when y values are not visually encoded", async () => {
    expect(scatterplotKoan).toBeDefined();

    const spec = cloneSpec(scatterplotKoan!.targetSpec);
    const firstMark = getFirstMark(spec);
    const encode = firstMark.encode as {
      enter: {
        y: unknown;
      };
    };

    encode.enter.y = { value: 100 };

    const result = await validateVegaSpec(scatterplotKoan!, spec);

    expect(result.passed).toBe(false);
    expect(result.results.find((check) => check.message.includes("higher y values"))?.passed).toBe(
      false,
    );
  });
});
