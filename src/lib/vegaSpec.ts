import type { VegaDatum } from "../koans/types";

function getDataName(dataDefinition: unknown) {
  return typeof dataDefinition === "object" && dataDefinition !== null
    ? (dataDefinition as Record<string, unknown>).name
    : undefined;
}

export function buildRuntimeVegaSpec(spec: Record<string, unknown>, dataset: VegaDatum[]) {
  const learnerData = Array.isArray(spec.data)
    ? spec.data.filter((dataDefinition) => getDataName(dataDefinition) !== "table")
    : [];

  return {
    ...spec,
    data: [
      {
        name: "table",
        values: dataset,
      },
      ...learnerData,
    ],
  };
}
