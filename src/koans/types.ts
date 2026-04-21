import type { TrackId } from "../tracks";

export type VegaKoanDifficulty = "beginner" | "intermediate" | "advanced";

export type VegaDatum = Record<string, string | number>;

export type VegaCheckPrimitive = string | number | boolean;

export type VegaKoanCheck =
  | {
      type: "marks-min-count";
      expected: number;
      message: string;
    }
  | {
      type: "first-mark-type";
      expected: string;
      message: string;
    }
  | {
      type: "first-mark-fill";
      expected: string;
      message: string;
    }
  | {
      type: "x-domain-sort-order";
      expected: "ascending" | "descending";
      message: string;
    }
  | {
      type: "has-scale";
      expected: string;
      message: string;
    }
  | {
      type: "rendered-mark-count";
      expected: number;
      message: string;
    }
  | {
      type: "rendered-mark-type";
      expected: string;
      message: string;
    }
  | {
      type: "rendered-x-domain";
      expected: Array<string | number>;
      message: string;
    }
  | {
      type: "markCount";
      expected: number;
      markType?: string;
      message: string;
    }
  | {
      type: "markType";
      expected: string;
      message: string;
    }
  | {
      type: "datumFieldValues";
      field: string;
      expected: VegaCheckPrimitive[];
      markType?: string;
      ordered?: boolean;
      message: string;
    }
  | {
      type: "relativePosition";
      field: string;
      expected: VegaCheckPrimitive[];
      channel: "x" | "y";
      order?: "ascending" | "descending";
      markType?: string;
      tolerance?: number;
      message: string;
    }
  | {
      type: "relativeSize";
      field: string;
      expected: VegaCheckPrimitive[];
      measure: "width" | "height";
      order: "ascending" | "descending";
      markType?: string;
      tolerance?: number;
      message: string;
    };

export type VegaKoan = {
  id: string;
  track: Extract<TrackId, "vega">;
  slug: string;
  title: string;
  summary: string;
  instructions: string;
  difficulty: VegaKoanDifficulty;
  topic: string;
  order: number;
  dataset: VegaDatum[];
  startingSpec: Record<string, unknown>;
  targetSpec: Record<string, unknown>;
  checks: VegaKoanCheck[];
};
