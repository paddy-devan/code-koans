import type { VegaDatum } from "../koans/types";

export function buildRuntimeVegaSpec(spec: Record<string, unknown>, dataset: VegaDatum[]) {
  return {
    ...spec,
    data: [
      {
        name: "table",
        values: dataset,
      },
    ],
  };
}
