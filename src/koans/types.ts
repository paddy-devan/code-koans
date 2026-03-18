export type VegaKoanDifficulty = "beginner" | "intermediate" | "advanced";

export type VegaDatum = Record<string, string | number>;

export type VegaKoan = {
  id: string;
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
};
