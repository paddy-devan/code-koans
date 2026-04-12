import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useParams } from "react-router-dom";
import { DatasetTable } from "../components/DatasetTable";
import { JsonSpecEditor } from "../components/JsonSpecEditor";
import { ValidationResultPanel } from "../components/ValidationResultPanel";
import { VegaChart } from "../components/VegaChart";
import { clearKoanDraft, getKoanDraft, saveKoanDraft } from "../lib/drafts";
import { formatJsonText } from "../lib/jsonFormatting";
import { getCachedProgress, loadProgress, recordSubmissionAttempt } from "../lib/persistence";
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
    setIsCompleted(getCachedProgress().completedKoanIds.includes(koan.id));

    void loadProgress().then((snapshot) => {
      setIsCompleted(snapshot.completedKoanIds.includes(koan.id));
    });
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

  function handleSpecChange(nextText: string) {
    if (!koan) {
      return;
    }

    setSpecText(nextText);
    saveKoanDraft(koan.id, nextText);
    setValidationResult(null);
  }

  if (!koan) {
    return (
      <section className="panel">
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
    <section className="panel panel-wide koan-page">
      <div className="koan-top-grid">
        <section className="detail-card koan-info-card">
          <h2>{koan.title}</h2>
          <div className="koan-tag-row">
            <span className={isCompleted ? "status-badge completed" : "status-badge pending"}>
              {isCompleted ? "Completed" : "Not completed"}
            </span>
            <span className="meta-tag">{koan.difficulty}</span>
            <span className="meta-tag">{koan.topic}</span>
          </div>
          <p>{koan.summary}</p>
          <p>{koan.instructions}</p>
        </section>

        <section className="koan-panel-card chart-stage-target">
          <VegaChart dataset={koan.dataset} spec={koan.targetSpec} title="Target Chart" />
        </section>
      </div>

      <div className="koan-workspace-grid">
        <section className="editor-panel">
          <div className="editor-header">
            <h3>Vega Spec</h3>
            <div className="editor-actions editor-actions-top">
              <button
                type="button"
                className="primary-button compact-button"
                onClick={() => {
                  if (!parsedSpec?.spec) {
                    return;
                  }

                  setIsChecking(true);

                  void validateVegaSpec(koan, parsedSpec.spec).then((nextValidationResult) => {
                    setValidationResult(nextValidationResult);
                    void recordSubmissionAttempt({
                      koanId: koan.id,
                      passed: nextValidationResult.passed,
                    }).then((snapshot) => {
                      setIsCompleted(snapshot.completedKoanIds.includes(koan.id));
                      setIsChecking(false);
                    });
                  });
                }}
                disabled={!parsedSpec?.spec || isChecking}
              >
                {isChecking ? "Checking..." : "Submit"}
              </button>
              <button
                type="button"
                className="secondary-button compact-button"
                onClick={() => {
                  const startingSpecText = formatSpec(koan.startingSpec);
                  clearKoanDraft(koan.id);
                  setSpecText(startingSpecText);
                  setValidationResult(null);
                }}
                disabled={isChecking}
              >
                Reset
              </button>
              <button
                type="button"
                className="secondary-button compact-button"
                onClick={() => {
                  if (!parsedSpec?.spec) {
                    return;
                  }

                  handleSpecChange(formatJsonText(specText));
                }}
                disabled={!parsedSpec?.spec || isChecking}
              >
                Format
              </button>
            </div>
          </div>
          <label className="sr-only" htmlFor="vega-spec-editor">
            Vega spec editor
          </label>
          <JsonSpecEditor
            id="vega-spec-editor"
            value={specText}
            onChange={handleSpecChange}
            disabled={isChecking}
          />
          {parsedSpec?.error ? (
            <p className="editor-error" role="alert">
              JSON error: {parsedSpec.error}
            </p>
          ) : null}
        </section>

        <section className="koan-panel-card chart-stage-preview workspace-preview-panel">
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

        <section className="dataset-panel workspace-dataset-panel">
          <h3>Dataset</h3>
          <DatasetTable rows={koan.dataset} />
        </section>
      </div>

      <ValidationResultPanel result={validationResult} />
    </section>
  );
}
