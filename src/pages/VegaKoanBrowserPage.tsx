import { Link } from "react-router-dom";
import { vegaKoans } from "../koans/vegaKoans";

export function VegaKoanBrowserPage() {
  return (
    <section className="panel">
      <p className="eyebrow">Checkpoint 2</p>
      <h2>Vega Koan Browser</h2>
      <p>Select a koan to view its current placeholder detail page.</p>

      <ul className="koan-list">
        {vegaKoans.map((koan) => (
          <li key={koan.id} className="koan-list-item">
            <Link to={`/vega/koans/${koan.id}`} className="koan-link">
              <span className="koan-link-title">{koan.title}</span>
              <span className="koan-link-meta">
                {koan.difficulty} · {koan.topic}
              </span>
            </Link>
            <p>{koan.summary}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
