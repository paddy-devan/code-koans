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
    startingSpec: {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      width: 320,
      height: 200,
      padding: 8,
      scales: [
        {
          name: "xscale",
          type: "band",
          domain: { data: "table", field: "category" },
          range: "width",
          padding: 0.15,
        },
        {
          name: "yscale",
          domain: { data: "table", field: "value" },
          nice: true,
          range: "height",
        },
      ],
      axes: [
        { orient: "bottom", scale: "xscale" },
        { orient: "left", scale: "yscale" },
      ],
      marks: [],
    },
    targetSpec: {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      width: 320,
      height: 200,
      padding: 8,
      scales: [
        {
          name: "xscale",
          type: "band",
          domain: { data: "table", field: "category" },
          range: "width",
          padding: 0.15,
        },
        {
          name: "yscale",
          domain: { data: "table", field: "value" },
          nice: true,
          range: "height",
        },
      ],
      axes: [
        { orient: "bottom", scale: "xscale" },
        { orient: "left", scale: "yscale" },
      ],
      marks: [
        {
          type: "rect",
          from: { data: "table" },
          encode: {
            enter: {
              x: { scale: "xscale", field: "category" },
              width: { scale: "xscale", band: 1 },
              y: { scale: "yscale", field: "value" },
              y2: { scale: "yscale", value: 0 },
              fill: { value: "#0a5c83" },
            },
          },
        },
      ],
    },
    checks: [
      {
        type: "marks-min-count",
        expected: 1,
        message: "Add at least one mark to render the bars.",
      },
      {
        type: "first-mark-type",
        expected: "rect",
        message: "Use a rect mark for the bar chart.",
      },
    ],
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
    startingSpec: {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      width: 320,
      height: 200,
      padding: 8,
      scales: [
        {
          name: "xscale",
          type: "band",
          domain: { data: "table", field: "category" },
          range: "width",
          padding: 0.15,
        },
        {
          name: "yscale",
          domain: { data: "table", field: "value" },
          nice: true,
          range: "height",
        },
      ],
      axes: [
        { orient: "bottom", scale: "xscale" },
        { orient: "left", scale: "yscale" },
      ],
      marks: [
        {
          type: "rect",
          from: { data: "table" },
          encode: {
            enter: {
              x: { scale: "xscale", field: "category" },
              width: { scale: "xscale", band: 1 },
              y: { scale: "yscale", field: "value" },
              y2: { scale: "yscale", value: 0 },
              fill: { value: "#1f7a4d" },
            },
          },
        },
      ],
    },
    targetSpec: {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      width: 320,
      height: 200,
      padding: 8,
      scales: [
        {
          name: "xscale",
          type: "band",
          domain: {
            data: "table",
            field: "category",
            sort: {
              field: "value",
              order: "descending",
            },
          },
          range: "width",
          padding: 0.15,
        },
        {
          name: "yscale",
          domain: { data: "table", field: "value" },
          nice: true,
          range: "height",
        },
      ],
      axes: [
        { orient: "bottom", scale: "xscale" },
        { orient: "left", scale: "yscale" },
      ],
      marks: [
        {
          type: "rect",
          from: { data: "table" },
          encode: {
            enter: {
              x: { scale: "xscale", field: "category" },
              width: { scale: "xscale", band: 1 },
              y: { scale: "yscale", field: "value" },
              y2: { scale: "yscale", value: 0 },
              fill: { value: "#1f7a4d" },
            },
          },
        },
      ],
    },
    checks: [
      {
        type: "marks-min-count",
        expected: 1,
        message: "Keep a mark in place so the chart still renders.",
      },
      {
        type: "first-mark-type",
        expected: "rect",
        message: "Use a rect mark for the bar chart.",
      },
      {
        type: "x-domain-sort-order",
        expected: "descending",
        message: "Sort the x-scale domain by value in descending order.",
      },
    ],
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
    startingSpec: {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      width: 320,
      height: 200,
      padding: 8,
      scales: [
        {
          name: "xscale",
          type: "band",
          domain: { data: "table", field: "category" },
          range: "width",
          padding: 0.15,
        },
        {
          name: "yscale",
          domain: { data: "table", field: "value" },
          nice: true,
          range: "height",
        },
      ],
      axes: [
        { orient: "bottom", scale: "xscale" },
        { orient: "left", scale: "yscale" },
      ],
      marks: [
        {
          type: "rect",
          from: { data: "table" },
          encode: {
            enter: {
              x: { scale: "xscale", field: "category" },
              width: { scale: "xscale", band: 1 },
              y: { scale: "yscale", field: "value" },
              y2: { scale: "yscale", value: 0 },
              fill: { value: "#0a5c83" },
            },
          },
        },
      ],
    },
    targetSpec: {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      width: 320,
      height: 200,
      padding: 8,
      scales: [
        {
          name: "xscale",
          type: "band",
          domain: { data: "table", field: "category" },
          range: "width",
          padding: 0.15,
        },
        {
          name: "yscale",
          domain: { data: "table", field: "value" },
          nice: true,
          range: "height",
        },
        {
          name: "color",
          type: "ordinal",
          domain: { data: "table", field: "category" },
          range: ["#0a5c83", "#d47a00", "#5f3dc4"],
        },
      ],
      axes: [
        { orient: "bottom", scale: "xscale" },
        { orient: "left", scale: "yscale" },
      ],
      marks: [
        {
          type: "rect",
          from: { data: "table" },
          encode: {
            enter: {
              x: { scale: "xscale", field: "category" },
              width: { scale: "xscale", band: 1 },
              y: { scale: "yscale", field: "value" },
              y2: { scale: "yscale", value: 0 },
              fill: { scale: "color", field: "category" },
            },
          },
        },
      ],
    },
    checks: [
      {
        type: "marks-min-count",
        expected: 1,
        message: "Keep a mark in place so the chart still renders.",
      },
      {
        type: "first-mark-type",
        expected: "rect",
        message: "Use a rect mark for the bar chart.",
      },
      {
        type: "has-scale",
        expected: "color",
        message: "Add a color scale for category-based coloring.",
      },
    ],
  },
];

export function getVegaKoanById(koanId: string) {
  return vegaKoans.find((koan) => koan.id === koanId);
}
