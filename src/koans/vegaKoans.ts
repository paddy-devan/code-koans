import type { VegaKoan } from "./types";

export const vegaKoans: VegaKoan[] = [
  {
    id: "bar-chart-basics",
    slug: "bar-chart-basics",
    title: "Bar Chart Basics",
    summary: "Build a simple bar chart from categorical data.",
    instructions:
      "Use the provided dataset to produce a bar chart with category labels along the horizontal axis and values encoded as bar height.",
    difficulty: "beginner",
    topic: "marks",
    order: 1,
    dataset: [
      { category: "A", value: 5 },
      { category: "B", value: 8 },
      { category: "C", value: 3 },
    ],
    startingSpec: {},
    targetSpec: {},
  },
  {
    id: "sort-bars-descending",
    slug: "sort-bars-descending",
    title: "Sort Bars Descending",
    summary: "Order bars from largest value to smallest value.",
    instructions:
      "Adjust the chart so bars are shown in descending order by value rather than in the original dataset order.",
    difficulty: "beginner",
    topic: "sorting",
    order: 2,
    dataset: [
      { category: "North", value: 12 },
      { category: "South", value: 6 },
      { category: "West", value: 9 },
    ],
    startingSpec: {},
    targetSpec: {},
  },
  {
    id: "color-by-category",
    slug: "color-by-category",
    title: "Color by Category",
    summary: "Use color to differentiate categorical groups.",
    instructions:
      "Create a bar chart where each category is visually distinguished with a separate color encoding.",
    difficulty: "intermediate",
    topic: "encoding",
    order: 3,
    dataset: [
      { category: "Alpha", value: 4 },
      { category: "Beta", value: 7 },
      { category: "Gamma", value: 10 },
    ],
    startingSpec: {},
    targetSpec: {},
  },
];

export function getVegaKoanById(koanId: string) {
  return vegaKoans.find((koan) => koan.id === koanId);
}
