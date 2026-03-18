import type { VegaValidationResult } from "../validation/vegaValidation";

type ValidationResultPanelProps = {
  result: VegaValidationResult | null;
};

export function ValidationResultPanel({ result }: ValidationResultPanelProps) {
  if (!result) {
    return (
      <section className="result-panel">
        <div className="result-header">
          <h3>Result</h3>
          <p>Submit your current spec to run the placeholder checks for this koan.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="result-panel">
      <div className="result-header">
        <h3>Result</h3>
        <p className={result.passed ? "result-status passed" : "result-status failed"}>
          {result.passed ? "Passed all checks." : "Some checks failed."}
        </p>
      </div>

      <ul className="result-list">
        {result.results.map((item) => (
          <li key={item.message} className="result-list-item">
            <span className={item.passed ? "result-pill passed" : "result-pill failed"}>
              {item.passed ? "Pass" : "Fail"}
            </span>
            <span>{item.message}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
