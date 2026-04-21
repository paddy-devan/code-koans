import type { VegaCheckPrimitive, VegaKoan, VegaKoanCheck } from "../koans/types";
import {
  type RenderedVegaState,
  type SceneItem,
  renderVegaForValidation,
} from "./vegaScenegraph";

export type VegaCheckResult = {
  message: string;
  passed: boolean;
};

export type VegaValidationResult = {
  passed: boolean;
  results: VegaCheckResult[];
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
    check.type === "rendered-x-domain" ||
    check.type === "markCount" ||
    check.type === "markType" ||
    check.type === "datumFieldValues" ||
    check.type === "relativePosition" ||
    check.type === "relativeSize" ||
    check.type === "dataRowCount" ||
    check.type === "dataFieldValues" ||
    check.type === "dataFieldOrder" ||
    check.type === "signalValue"
  );
}

function getDataNames(checks: VegaKoanCheck[]) {
  return Array.from(
    new Set(
      checks.flatMap((check) =>
        check.type === "dataRowCount" ||
        check.type === "dataFieldValues" ||
        check.type === "dataFieldOrder"
          ? [check.dataName]
          : [],
      ),
    ),
  );
}

function getSignalNames(checks: VegaKoanCheck[]) {
  return Array.from(
    new Set(checks.flatMap((check) => (check.type === "signalValue" ? [check.signalName] : []))),
  );
}

function getSceneItemsForCheck(renderedState: RenderedVegaState, check: { markType?: string }) {
  return check.markType
    ? renderedState.sceneItems.filter((item) => item.markType === check.markType)
    : renderedState.sceneItems;
}

function getDatumValue(item: SceneItem, field: string) {
  const value = item.datum?.[field];

  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? value
    : undefined;
}

function getRuntimeFieldValue(row: Record<string, unknown>, field: string) {
  const value = row[field];

  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? value
    : undefined;
}

function hasSamePrimitiveValues(actual: VegaCheckPrimitive[], expected: VegaCheckPrimitive[]) {
  if (actual.length !== expected.length) {
    return false;
  }

  const sortedActual = [...actual].map(primitiveKey).sort();
  const sortedExpected = [...expected].map(primitiveKey).sort();

  return sortedActual.every((value, index) => value === sortedExpected[index]);
}

function primitiveKey(value: VegaCheckPrimitive) {
  return `${typeof value}:${String(value)}`;
}

function hasSamePrimitiveOrder(actual: VegaCheckPrimitive[], expected: VegaCheckPrimitive[]) {
  return actual.length === expected.length && actual.every((value, index) => value === expected[index]);
}

function getPosition(item: SceneItem, channel: "x" | "y") {
  return channel === "x" ? item.x : item.y;
}

function getSize(item: SceneItem, measure: "width" | "height") {
  const directSize = measure === "width" ? item.width : item.height;

  if (typeof directSize === "number") {
    return Math.abs(directSize);
  }

  const start = measure === "width" ? item.x : item.y;
  const end = measure === "width" ? item.x2 : item.y2;

  return typeof start === "number" && typeof end === "number" ? Math.abs(end - start) : undefined;
}

function getItemsByExpectedValues(
  sceneItems: SceneItem[],
  field: string,
  expected: VegaCheckPrimitive[],
) {
  return expected.map((expectedValue) =>
    sceneItems.find((item) => getDatumValue(item, field) === expectedValue),
  );
}

function hasStrictRelativeOrder(
  values: number[],
  order: "ascending" | "descending",
  tolerance = 0.001,
) {
  return values.every((value, index) => {
    if (index === 0) {
      return true;
    }

    const previous = values[index - 1];

    return order === "ascending"
      ? value > previous + tolerance
      : value < previous - tolerance;
  });
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
    case "markCount":
    case "markType":
    case "datumFieldValues":
    case "relativePosition":
    case "relativeSize":
    case "dataRowCount":
    case "dataFieldValues":
    case "dataFieldOrder":
    case "signalValue":
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
    case "markCount": {
      const sceneItems = getSceneItemsForCheck(renderedState, check);

      return {
        message: check.message,
        passed: sceneItems.length === check.expected,
      };
    }
    case "markType":
      return {
        message: check.message,
        passed: renderedState.markTypes.includes(check.expected),
      };
    case "datumFieldValues": {
      const actualValues = getSceneItemsForCheck(renderedState, check)
        .map((item) => getDatumValue(item, check.field))
        .filter((value): value is VegaCheckPrimitive => value !== undefined);

      return {
        message: check.message,
        passed: check.ordered
          ? hasSamePrimitiveOrder(actualValues, check.expected)
          : hasSamePrimitiveValues(actualValues, check.expected),
      };
    }
    case "relativePosition": {
      const sceneItems = getSceneItemsForCheck(renderedState, check);
      const matchingItems = getItemsByExpectedValues(sceneItems, check.field, check.expected);
      const positions = matchingItems.map((item) =>
        item ? getPosition(item, check.channel) : undefined,
      );

      return {
        message: check.message,
        passed:
          positions.every((position): position is number => typeof position === "number") &&
          hasStrictRelativeOrder(
            positions.filter((position): position is number => typeof position === "number"),
            check.order ?? "ascending",
            check.tolerance,
          ),
      };
    }
    case "relativeSize": {
      const sceneItems = getSceneItemsForCheck(renderedState, check);
      const matchingItems = getItemsByExpectedValues(sceneItems, check.field, check.expected);
      const sizes = matchingItems.map((item) => (item ? getSize(item, check.measure) : undefined));

      return {
        message: check.message,
        passed:
          sizes.every((size): size is number => typeof size === "number") &&
          hasStrictRelativeOrder(
            sizes.filter((size): size is number => typeof size === "number"),
            check.order,
            check.tolerance,
          ),
      };
    }
    case "dataRowCount": {
      const rows = renderedState.data[check.dataName] ?? [];

      return {
        message: check.message,
        passed: rows.length === check.expected,
      };
    }
    case "dataFieldValues": {
      const rows = renderedState.data[check.dataName] ?? [];
      const actualValues = rows
        .map((row) => getRuntimeFieldValue(row, check.field))
        .filter((value): value is VegaCheckPrimitive => value !== undefined);

      return {
        message: check.message,
        passed: check.ordered
          ? hasSamePrimitiveOrder(actualValues, check.expected)
          : hasSamePrimitiveValues(actualValues, check.expected),
      };
    }
    case "dataFieldOrder": {
      const rows = renderedState.data[check.dataName] ?? [];
      const actualValues = rows
        .map((row) => getRuntimeFieldValue(row, check.field))
        .filter((value): value is VegaCheckPrimitive => value !== undefined);

      return {
        message: check.message,
        passed: hasSamePrimitiveOrder(actualValues, check.expected),
      };
    }
    case "signalValue":
      return {
        message: check.message,
        passed: renderedState.signals[check.signalName] === check.expected,
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
    const renderedState = needsRenderedValidation
      ? await renderVegaForValidation(spec, koan, {
          dataNames: getDataNames(koan.checks),
          signalNames: getSignalNames(koan.checks),
        })
      : null;

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
