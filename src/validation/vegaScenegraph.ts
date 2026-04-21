import { parse, View } from "vega";
import type { VegaKoan } from "../koans/types";
import { buildRuntimeVegaSpec } from "../lib/vegaSpec";

export type SceneItem = {
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

export type RenderedVegaState = {
  sceneItems: SceneItem[];
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

function getNumber(record: Record<string, unknown>, key: string) {
  const value = record[key];

  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function getString(record: Record<string, unknown>, key: string) {
  const value = record[key];

  return typeof value === "string" ? value : undefined;
}

function normalizeSceneItem(item: Record<string, unknown>): SceneItem | null {
  const mark = asRecord(item.mark);
  const markType = mark?.marktype;

  if (typeof markType !== "string") {
    return null;
  }

  return {
    markType,
    role: typeof mark?.role === "string" ? mark.role : undefined,
    datum: asRecord(item.datum) ?? undefined,
    x: getNumber(item, "x"),
    y: getNumber(item, "y"),
    x2: getNumber(item, "x2"),
    y2: getNumber(item, "y2"),
    width: getNumber(item, "width"),
    height: getNumber(item, "height"),
    fill: getString(item, "fill"),
    stroke: getString(item, "stroke"),
    text: getString(item, "text"),
    opacity: getNumber(item, "opacity"),
  };
}

function collectSceneItems(item: unknown, sceneItems: SceneItem[]) {
  const record = asRecord(item);

  if (!record) {
    return;
  }

  const mark = asRecord(record.mark);

  if (mark?.role === "mark") {
    const sceneItem = normalizeSceneItem(record);

    if (sceneItem) {
      sceneItems.push(sceneItem);
    }
  }

  if (Array.isArray(record.items)) {
    record.items.forEach((child) => collectSceneItems(child, sceneItems));
  }
}

export function extractSceneItems(scenegraph: unknown): SceneItem[] {
  const root = asRecord(scenegraph)?.root ?? scenegraph;
  const sceneItems: SceneItem[] = [];

  collectSceneItems(root, sceneItems);

  return sceneItems;
}

export async function renderVegaForValidation(
  spec: Record<string, unknown>,
  koan: VegaKoan,
): Promise<RenderedVegaState> {
  const runtimeSpec = buildRuntimeVegaSpec(spec, koan.dataset);
  const view = new View(parse(runtimeSpec), { renderer: "none" });

  try {
    await view.runAsync();

    const sceneItems = extractSceneItems((view.scenegraph() as unknown as VegaScenegraph).root);
    const xScale = view.scale("xscale") as { domain?: () => unknown[] } | undefined;
    const xDomain = xScale?.domain?.();

    return {
      sceneItems,
      markCount: sceneItems.length,
      markTypes: Array.from(new Set(sceneItems.map((item) => item.markType))),
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
