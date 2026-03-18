import { useParams } from "react-router-dom";
import { Link } from "react-router-dom";
import { getVegaKoanById } from "../koans/vegaKoans";

export function VegaKoanPage() {
  const { koanId } = useParams();
  const koan = koanId ? getVegaKoanById(koanId) : undefined;

  if (!koan) {
    return (
      <section className="panel">
        <p className="eyebrow">Checkpoint 2</p>
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
      <p className="eyebrow">Checkpoint 2</p>
      <h2>{koan.title}</h2>
      <p>{koan.summary}</p>

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
    </section>
  );
}
