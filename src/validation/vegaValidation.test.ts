import { describe, expect, it } from "vitest";
import { getVegaKoanById } from "../koans/vegaKoans";
import { validateVegaSpec } from "./vegaValidation";

const barChartKoan = getVegaKoanById("bar-chart-basics");

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
