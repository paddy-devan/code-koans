import type { VegaKoan } from "./types";

export const vegaKoans: VegaKoan[] = [
  {
    id: "bar-chart-basics",
    track: "vega",
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
        type: "markCount",
        expected: 3,
        markType: "rect",
        message: "Render three bar marks for the three categories in the dataset.",
      },
      {
        type: "markType",
        expected: "rect",
        message: "Render rect marks in the final chart output.",
      },
      {
        type: "datumFieldValues",
        field: "category",
        expected: ["A", "B", "C"],
        markType: "rect",
        message: "Render a bar for each expected category.",
      },
      {
        type: "relativePosition",
        field: "category",
        expected: ["A", "B", "C"],
        channel: "x",
        markType: "rect",
        message: "Place the bars in the expected left-to-right category order.",
      },
      {
        type: "relativeSize",
        field: "category",
        expected: ["B", "A", "C"],
        measure: "height",
        order: "descending",
        markType: "rect",
        message: "Encode the values as relative bar heights, with B tallest and C shortest.",
      },
    ],
  },
  {
    id: "sort-bars-descending",
    track: "vega",
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
    track: "vega",
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
        type: "markCount",
        expected: 3,
        markType: "rect",
        message: "Render one bar for each category.",
      },
      {
        type: "markType",
        expected: "rect",
        message: "Use rect marks for the bar chart.",
      },
      {
        type: "datumFieldValues",
        field: "category",
        expected: ["Alpha", "Beta", "Gamma"],
        markType: "rect",
        message: "Render a bar for each category.",
      },
      {
        type: "distinctPropertyValues",
        property: "fill",
        expected: 3,
        markType: "rect",
        message: "Render the three categories with three distinct fill colors.",
      },
    ],
  },
  {
    id: "filter-bars-by-value",
    track: "vega",
    slug: "filter-bars-by-value",
    title: "Filter Bars by Value",
    summary: "Use a data transform to keep only larger values.",
    instructions:
      "Create a derived dataset named filteredTable that keeps rows with value at least 7, then render bars from that filtered data.",
    difficulty: "beginner",
    topic: "transforms",
    order: 4,
    dataset: [
      { category: "Alpha", value: 4 },
      { category: "Beta", value: 7 },
      { category: "Gamma", value: 10 },
      { category: "Delta", value: 2 },
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
      data: [
        {
          name: "filteredTable",
          source: "table",
          transform: [{ type: "filter", expr: "datum.value >= 7" }],
        },
      ],
      scales: [
        {
          name: "xscale",
          type: "band",
          domain: { data: "filteredTable", field: "category" },
          range: "width",
          padding: 0.15,
        },
        {
          name: "yscale",
          domain: { data: "filteredTable", field: "value" },
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
          from: { data: "filteredTable" },
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
        type: "dataRowCount",
        dataName: "filteredTable",
        expected: 2,
        message: "Create a filteredTable dataset with only the two rows whose value is at least 7.",
      },
      {
        type: "dataFieldValues",
        dataName: "filteredTable",
        field: "category",
        expected: ["Beta", "Gamma"],
        message: "Keep Beta and Gamma in the filtered dataset.",
      },
      {
        type: "dataFieldOrder",
        dataName: "filteredTable",
        field: "category",
        expected: ["Beta", "Gamma"],
        message: "Preserve the filtered rows in their original order.",
      },
      {
        type: "markCount",
        expected: 2,
        markType: "rect",
        message: "Render one bar for each filtered row.",
      },
    ],
  },
  {
    id: "scatterplot-basics",
    track: "vega",
    slug: "scatterplot-basics",
    title: "Scatterplot Basics",
    summary: "Plot individual records as points on x and y scales.",
    instructions:
      "Use symbol marks to plot each row as a point, with x encoded by the x field and y encoded by the y field.",
    difficulty: "beginner",
    topic: "marks",
    order: 5,
    dataset: [
      { label: "A", x: 1, y: 2 },
      { label: "B", x: 2, y: 5 },
      { label: "C", x: 3, y: 9 },
    ],
    startingSpec: {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      width: 320,
      height: 200,
      padding: 8,
      scales: [
        {
          name: "xscale",
          domain: { data: "table", field: "x" },
          nice: true,
          range: "width",
        },
        {
          name: "yscale",
          domain: { data: "table", field: "y" },
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
          domain: { data: "table", field: "x" },
          nice: true,
          range: "width",
        },
        {
          name: "yscale",
          domain: { data: "table", field: "y" },
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
          type: "symbol",
          from: { data: "table" },
          encode: {
            enter: {
              x: { scale: "xscale", field: "x" },
              y: { scale: "yscale", field: "y" },
              size: { value: 140 },
              fill: { value: "#0a5c83" },
            },
          },
        },
      ],
    },
    checks: [
      {
        type: "markCount",
        expected: 3,
        markType: "symbol",
        message: "Render one point for each row in the dataset.",
      },
      {
        type: "markType",
        expected: "symbol",
        message: "Use symbol marks for the scatterplot points.",
      },
      {
        type: "datumFieldValues",
        field: "label",
        expected: ["A", "B", "C"],
        markType: "symbol",
        message: "Render points for labels A, B, and C.",
      },
      {
        type: "relativePosition",
        field: "label",
        expected: ["A", "B", "C"],
        channel: "x",
        markType: "symbol",
        message: "Place the points left-to-right by increasing x value.",
      },
      {
        type: "relativePosition",
        field: "label",
        expected: ["A", "B", "C"],
        channel: "y",
        order: "descending",
        markType: "symbol",
        message: "Place higher y values higher in the chart.",
      },
    ],
  },
  {
    id: "calculate-derived-values",
    track: "vega",
    slug: "calculate-derived-values",
    title: "Calculate Derived Values",
    summary: "Create a calculated field with a Vega formula transform.",
    instructions:
      "Create a derived dataset named doubledTable with a doubleValue field equal to value multiplied by 2, then render bars using that calculated field.",
    difficulty: "beginner",
    topic: "transforms",
    order: 6,
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
      data: [
        {
          name: "doubledTable",
          source: "table",
          transform: [{ type: "formula", expr: "datum.value * 2", as: "doubleValue" }],
        },
      ],
      scales: [
        {
          name: "xscale",
          type: "band",
          domain: { data: "doubledTable", field: "category" },
          range: "width",
          padding: 0.15,
        },
        {
          name: "yscale",
          domain: { data: "doubledTable", field: "doubleValue" },
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
          from: { data: "doubledTable" },
          encode: {
            enter: {
              x: { scale: "xscale", field: "category" },
              width: { scale: "xscale", band: 1 },
              y: { scale: "yscale", field: "doubleValue" },
              y2: { scale: "yscale", value: 0 },
              fill: { value: "#0a5c83" },
            },
          },
        },
      ],
    },
    checks: [
      {
        type: "dataRowCount",
        dataName: "doubledTable",
        expected: 3,
        message: "Create a doubledTable dataset with one row for each original category.",
      },
      {
        type: "dataFieldValues",
        dataName: "doubledTable",
        field: "doubleValue",
        expected: [8, 14, 20],
        message: "Calculate doubleValue as twice the original value.",
      },
      {
        type: "datumFieldValues",
        field: "category",
        expected: ["Alpha", "Beta", "Gamma"],
        markType: "rect",
        message: "Render one bar for each calculated row.",
      },
      {
        type: "relativeSize",
        field: "category",
        expected: ["Gamma", "Beta", "Alpha"],
        measure: "height",
        order: "descending",
        markType: "rect",
        message: "Use doubleValue for bar height, with Gamma tallest and Alpha shortest.",
      },
    ],
  },
  {
    id: "signal-threshold-filter",
    track: "vega",
    slug: "signal-threshold-filter",
    title: "Signal Threshold Filter",
    summary: "Use a signal value inside a data transform.",
    instructions:
      "Create a threshold signal with value 7, then use it to build a filteredByThreshold dataset and render the remaining rows.",
    difficulty: "intermediate",
    topic: "signals",
    order: 7,
    dataset: [
      { category: "Alpha", value: 4 },
      { category: "Beta", value: 7 },
      { category: "Gamma", value: 10 },
      { category: "Delta", value: 2 },
    ],
    startingSpec: {
      $schema: "https://vega.github.io/schema/vega/v5.json",
      width: 320,
      height: 200,
      padding: 8,
      signals: [{ name: "threshold", value: 0 }],
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
      signals: [{ name: "threshold", value: 7 }],
      data: [
        {
          name: "filteredByThreshold",
          source: "table",
          transform: [{ type: "filter", expr: "datum.value >= threshold" }],
        },
      ],
      scales: [
        {
          name: "xscale",
          type: "band",
          domain: { data: "filteredByThreshold", field: "category" },
          range: "width",
          padding: 0.15,
        },
        {
          name: "yscale",
          domain: { data: "filteredByThreshold", field: "value" },
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
          from: { data: "filteredByThreshold" },
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
        type: "signalValue",
        signalName: "threshold",
        expected: 7,
        message: "Set the threshold signal to 7.",
      },
      {
        type: "dataRowCount",
        dataName: "filteredByThreshold",
        expected: 2,
        message: "Create a filteredByThreshold dataset with the two rows at or above the threshold.",
      },
      {
        type: "dataFieldValues",
        dataName: "filteredByThreshold",
        field: "category",
        expected: ["Beta", "Gamma"],
        message: "Keep Beta and Gamma after applying the threshold.",
      },
      {
        type: "markCount",
        expected: 2,
        markType: "rect",
        message: "Render one bar for each threshold-filtered row.",
      },
    ],
  },
];

export function getVegaKoanById(koanId: string) {
  return vegaKoans.find((koan) => koan.id === koanId);
}

export const orderedVegaKoans = [...vegaKoans].sort((firstKoan, secondKoan) => {
  if (firstKoan.order !== secondKoan.order) {
    return firstKoan.order - secondKoan.order;
  }

  return firstKoan.id.localeCompare(secondKoan.id);
});
