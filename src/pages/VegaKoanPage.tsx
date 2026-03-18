import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { VegaChart } from "../components/VegaChart";
import { getVegaKoanById } from "../koans/vegaKoans";

function formatSpec(spec: Record<string, unknown>) {
  return JSON.stringify(spec, null, 2);
}

export function VegaKoanPage() {
  const { koanId } = useParams();
  const koan = koanId ? getVegaKoanById(koanId) : undefined;
  const [specText, setSpecText] = useState("");

  useEffect(() => {
    if (!koan) {
      return;
    }

    setSpecText(formatSpec(koan.startingSpec));
  }, [koan]);

  const parsedSpec = useMemo(() => {
    if (!koan) {
      return null;
    }

    try {
      return {
        spec: JSON.parse(specText) as Record<string, unknown>,
        error: null,
      };
    } catch (error) {
      return {
        spec: null,
        error: error instanceof Error ? error.message : "Invalid JSON.",
      };
    }
  }, [koan, specText]);

  if (!koan) {
    return (
      <section className="panel">
        <p className="eyebrow">Checkpoint 3</p>
        <h2>Koan Not Found</h2>
        <p>No Vega koan exists for the id "{koanId ?? "unknown"}".</p>
        <p>
          <Link to="/vega/koans" className="inline-link">
            Return to the koan browser
          </Link>
        </p>
      </section>
    );
  }

  return (
    <section className="panel">
      <p className="eyebrow">Checkpoint 4</p>
      <h2>{koan.title}</h2>
      <p>{koan.summary}</p>

      <div className="chart-grid">
        <VegaChart dataset={koan.dataset} spec={koan.targetSpec} title="Target Chart" />

        {parsedSpec?.spec ? (
          <VegaChart dataset={koan.dataset} spec={parsedSpec.spec} title="Live Preview" />
        ) : (
          <section className="chart-panel">
            <div className="chart-header">
              <h3>Live Preview</h3>
            </div>
            <div className="chart-frame chart-placeholder">
              <p>Preview unavailable until the JSON spec parses correctly.</p>
            </div>
          </section>
        )}
      </div>

      <div className="detail-grid">
        <div>
          <h3>Instructions</h3>
          <p>{koan.instructions}</p>
        </div>
        <div>
          <h3>Metadata</h3>
          <dl className="meta-list">
            <div>
              <dt>Difficulty</dt>
              <dd>{koan.difficulty}</dd>
            </div>
            <div>
              <dt>Topic</dt>
              <dd>{koan.topic}</dd>
            </div>
            <div>
              <dt>Order</dt>
              <dd>{koan.order}</dd>
            </div>
          </dl>
        </div>
      </div>

      <section className="editor-panel">
        <div className="editor-header">
          <h3>Editable Spec</h3>
          <p>Update the Vega JSON below to change the live preview.</p>
        </div>
        <label className="sr-only" htmlFor="vega-spec-editor">
          Vega spec editor
        </label>
        <textarea
          id="vega-spec-editor"
          className="spec-editor"
          value={specText}
          onChange={(event) => setSpecText(event.target.value)}
          spellCheck={false}
        />
        {parsedSpec?.error ? (
          <p className="editor-error" role="alert">
            JSON error: {parsedSpec.error}
          </p>
        ) : null}
      </section>
    </section>
  );
}
