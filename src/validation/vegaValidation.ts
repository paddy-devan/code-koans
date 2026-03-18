import type { VegaKoan, VegaKoanCheck } from "../koans/types";
import { buildRuntimeVegaSpec } from "../lib/vegaSpec";
import { parse, View } from "vega";

export type VegaCheckResult = {
  message: string;
  passed: boolean;
};

export type VegaValidationResult = {
  passed: boolean;
  results: VegaCheckResult[];
};

type RenderedVegaState = {
  markCount: number;
  markTypes: string[];
  xDomain: Array<string | number>;
};

type VegaScenegraph = {
  root: unknown;
};

function asRecord(value: unknown) {
  return typeof value === "object" && value !== null ? (value as Record<string, unknown>) : null;
}

function getMarks(spec: Record<string, unknown>) {
  return Array.isArray(spec.marks) ? spec.marks : [];
}

function getScales(spec: Record<string, unknown>) {
  return Array.isArray(spec.scales) ? spec.scales : [];
}

function isRenderedCheck(check: VegaKoanCheck) {
  return (
    check.type === "rendered-mark-count" ||
    check.type === "rendered-mark-type" ||
    check.type === "rendered-x-domain"
  );
}

function collectRenderedMarkItems(item: unknown, items: Array<Record<string, unknown>>) {
  const record = asRecord(item);

  if (!record) {
    return;
  }

  const mark = asRecord(record.mark);

  if (mark?.role === "mark") {
    items.push(record);
  }

  if (Array.isArray(record.items)) {
    record.items.forEach((child) => collectRenderedMarkItems(child, items));
  }
}

async function getRenderedState(
  spec: Record<string, unknown>,
  koan: VegaKoan,
): Promise<RenderedVegaState> {
  const runtimeSpec = buildRuntimeVegaSpec(spec, koan.dataset);
  const view = new View(parse(runtimeSpec), { renderer: "none" });

  try {
    await view.runAsync();

    const renderedItems: Array<Record<string, unknown>> = [];
    collectRenderedMarkItems((view.scenegraph() as unknown as VegaScenegraph).root, renderedItems);

    const xScale = view.scale("xscale") as { domain?: () => unknown[] } | undefined;
    const xDomain = xScale?.domain?.();

    return {
      markCount: renderedItems.length,
      markTypes: Array.from(
        new Set(
          renderedItems
            .map((item) => asRecord(item.mark)?.marktype)
            .filter((value): value is string => typeof value === "string"),
        ),
      ),
      xDomain: Array.isArray(xDomain)
        ? xDomain.filter((value): value is string | number =>
            typeof value === "string" || typeof value === "number",
          )
        : [],
    };
  } finally {
    view.finalize();
  }
}

function runSpecCheck(spec: Record<string, unknown>, check: VegaKoanCheck): VegaCheckResult {
  const marks = getMarks(spec);
  const firstMark = asRecord(marks[0]);
  const firstMarkEncode = asRecord(firstMark?.encode);
  const firstMarkEnter = asRecord(firstMarkEncode?.enter);
  const firstMarkFill = asRecord(firstMarkEnter?.fill);
  const scales = getScales(spec);

  switch (check.type) {
    case "marks-min-count":
      return {
        message: check.message,
        passed: marks.length >= check.expected,
      };
    case "first-mark-type":
      return {
        message: check.message,
        passed: firstMark?.type === check.expected,
      };
    case "first-mark-fill":
      return {
        message: check.message,
        passed: firstMarkFill?.value === check.expected,
      };
    case "x-domain-sort-order": {
      const xScale = scales.find((scale) => asRecord(scale)?.name === "xscale");
      const domain = asRecord(asRecord(xScale)?.domain);
      const sort = asRecord(domain?.sort);

      return {
        message: check.message,
        passed: sort?.order === check.expected,
      };
    }
    case "has-scale":
      return {
        message: check.message,
        passed: scales.some((scale) => asRecord(scale)?.name === check.expected),
      };
    case "rendered-mark-count":
    case "rendered-mark-type":
    case "rendered-x-domain":
      return {
        message: check.message,
        passed: false,
      };
  }
}

function runRenderedCheck(
  renderedState: RenderedVegaState,
  check: VegaKoanCheck,
): VegaCheckResult {
  switch (check.type) {
    case "rendered-mark-count":
      return {
        message: check.message,
        passed: renderedState.markCount === check.expected,
      };
    case "rendered-mark-type":
      return {
        message: check.message,
        passed: renderedState.markTypes.includes(check.expected),
      };
    case "rendered-x-domain":
      return {
        message: check.message,
        passed:
          renderedState.xDomain.length === check.expected.length &&
          renderedState.xDomain.every((value, index) => value === check.expected[index]),
      };
    case "marks-min-count":
    case "first-mark-type":
    case "first-mark-fill":
    case "x-domain-sort-order":
    case "has-scale":
      return {
        message: check.message,
        passed: false,
      };
  }
}

export async function validateVegaSpec(
  koan: VegaKoan,
  spec: Record<string, unknown>,
): Promise<VegaValidationResult> {
  try {
    const needsRenderedValidation = koan.checks.some((check) => isRenderedCheck(check));
    const renderedState = needsRenderedValidation ? await getRenderedState(spec, koan) : null;

    const results = koan.checks.map((check) =>
      isRenderedCheck(check) && renderedState
        ? runRenderedCheck(renderedState, check)
        : runSpecCheck(spec, check),
    );

    return {
      passed: results.every((result) => result.passed),
      results,
    };
  } catch (error) {
    return {
      passed: false,
      results: [
        {
          message:
            error instanceof Error
              ? `Validation could not inspect the rendered result: ${error.message}`
              : "Validation could not inspect the rendered result.",
          passed: false,
        },
      ],
    };
  }
}
