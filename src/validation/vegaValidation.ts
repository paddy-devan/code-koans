import type { VegaKoan, VegaKoanCheck } from "../koans/types";

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

function runCheck(spec: Record<string, unknown>, check: VegaKoanCheck): VegaCheckResult {
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
  }
}

export function validateVegaSpec(
  koan: VegaKoan,
  spec: Record<string, unknown>,
): VegaValidationResult {
  const results = koan.checks.map((check) => runCheck(spec, check));

  return {
    passed: results.every((result) => result.passed),
    results,
  };
}
