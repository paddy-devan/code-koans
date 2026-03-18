import { useEffect, useRef, useState } from "react";
import embed from "vega-embed";
import { buildRuntimeVegaSpec } from "../lib/vegaSpec";
import type { VegaDatum } from "../koans/types";

type VegaChartProps = {
  dataset: VegaDatum[];
  spec: Record<string, unknown>;
  title: string;
};

export function VegaChart({ dataset, spec, title }: VegaChartProps) {
  const chartRef = useRef<HTMLDivElement | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const container = chartRef.current;

    if (!container) {
      return;
    }

    let isCancelled = false;
    let finalize: (() => void) | undefined;

    async function renderChart(target: HTMLDivElement) {
      setError(null);
      target.innerHTML = "";

      try {
        const result = await embed(target, buildRuntimeVegaSpec(spec, dataset), {
          actions: false,
          renderer: "svg",
        });

        if (isCancelled) {
          result.finalize();
          return;
        }

        finalize = () => result.finalize();
      } catch (renderError) {
        if (isCancelled) {
          return;
        }

        const message =
          renderError instanceof Error ? renderError.message : "Unknown chart error.";
        setError(message);
      }
    }

    void renderChart(container);

    return () => {
      isCancelled = true;
      finalize?.();
    };
  }, [dataset, spec]);

  return (
    <div className="chart-panel">
      <div className="chart-header">
        <h3>{title}</h3>
      </div>
      <div ref={chartRef} className="chart-frame" aria-label={title} />
      {error ? (
        <p className="chart-error" role="alert">
          Chart error: {error}
        </p>
      ) : null}
    </div>
  );
}
