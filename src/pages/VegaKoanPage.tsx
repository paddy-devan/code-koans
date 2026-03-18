import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { ValidationResultPanel } from "../components/ValidationResultPanel";
import { VegaChart } from "../components/VegaChart";
import { clearKoanDraft, getKoanDraft, saveKoanDraft } from "../lib/drafts";
import { isKoanCompleted, markKoanCompleted } from "../lib/progress";
import { getVegaKoanById } from "../koans/vegaKoans";
import type { VegaValidationResult } from "../validation/vegaValidation";
import { validateVegaSpec } from "../validation/vegaValidation";

function formatSpec(spec: Record<string, unknown>) {
  return JSON.stringify(spec, null, 2);
}

export function VegaKoanPage() {
  const { koanId } = useParams();
  const koan = koanId ? getVegaKoanById(koanId) : undefined;
  const [specText, setSpecText] = useState("");
  const [validationResult, setValidationResult] = useState<VegaValidationResult | null>(null);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (!koan) {
      return;
    }

    const savedDraft = getKoanDraft(koan.id);
    setSpecText(savedDraft ?? formatSpec(koan.startingSpec));
    setValidationResult(null);
    setIsCompleted(isKoanCompleted(koan.id));
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
        <p className="eyebrow">Checkpoint 8</p>
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
      <p className="eyebrow">Checkpoint 8</p>
      <h2>{koan.title}</h2>
      <p>{koan.summary}</p>
      <p className="progress-line">
        Status:{" "}
        <span className={isCompleted ? "status-badge completed" : "status-badge pending"}>
          {isCompleted ? "Completed" : "Not completed"}
        </span>
      </p>

      <div className="chart-grid">
        <section className="chart-stage chart-stage-target">
          <div className="chart-stage-header">
            <p className="eyebrow">Reference</p>
            <p className="chart-stage-copy">Match this output as closely as you can.</p>
          </div>
          <VegaChart dataset={koan.dataset} spec={koan.targetSpec} title="Target Chart" />
        </section>

        <section className="chart-stage chart-stage-preview">
          <div className="chart-stage-header">
            <p className="eyebrow">Your Work</p>
            <p className="chart-stage-copy">The preview updates from the current editor draft.</p>
          </div>
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
        </section>
      </div>

      <div className="detail-grid detail-grid-wide">
        <div className="detail-card">
          <h3>Instructions</h3>
          <p>{koan.instructions}</p>
          <p className="support-copy">
            Edit the Vega JSON, compare your preview against the target chart, then submit when
            the structure looks right.
          </p>
        </div>
        <div className="detail-card">
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
          <p>
            Update the Vega JSON below to change the live preview. Draft edits are saved in this
            browser.
          </p>
        </div>
        <label className="sr-only" htmlFor="vega-spec-editor">
          Vega spec editor
        </label>
        <textarea
          id="vega-spec-editor"
          className="spec-editor"
          value={specText}
          onChange={(event) => {
            const nextText = event.target.value;
            setSpecText(nextText);
            saveKoanDraft(koan.id, nextText);
            setValidationResult(null);
          }}
          spellCheck={false}
        />
        {parsedSpec?.error ? (
          <p className="editor-error" role="alert">
            JSON error: {parsedSpec.error}
          </p>
        ) : null}
        <div className="editor-actions">
          <button
            type="button"
            className="primary-button"
            onClick={() => {
              if (!parsedSpec?.spec) {
                return;
              }

              setIsChecking(true);

              void validateVegaSpec(koan, parsedSpec.spec).then((nextValidationResult) => {
                setValidationResult(nextValidationResult);
                setIsChecking(false);

                if (nextValidationResult.passed) {
                  markKoanCompleted(koan.id);
                  setIsCompleted(true);
                }
              });
            }}
            disabled={!parsedSpec?.spec || isChecking}
          >
            {isChecking ? "Checking..." : "Submit / Check"}
          </button>
          <button
            type="button"
            className="secondary-button"
            onClick={() => {
              const startingSpecText = formatSpec(koan.startingSpec);
              clearKoanDraft(koan.id);
              setSpecText(startingSpecText);
              setValidationResult(null);
            }}
            disabled={isChecking}
          >
            Reset To Starting Spec
          </button>
        </div>
      </section>

      <details className="dataset-panel">
        <summary>View Dataset</summary>
        <pre className="dataset-preview">{JSON.stringify(koan.dataset, null, 2)}</pre>
      </details>

      <ValidationResultPanel result={validationResult} />
    </section>
  );
}
