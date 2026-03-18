export type VegaKoanDifficulty = "beginner" | "intermediate" | "advanced";

export type VegaKoan = {
  id: string;
  slug: string;
  title: string;
  summary: string;
  instructions: string;
  difficulty: VegaKoanDifficulty;
  topic: string;
  order: number;
  dataset: unknown;
  startingSpec: Record<string, unknown>;
  targetSpec: Record<string, unknown>;
};
