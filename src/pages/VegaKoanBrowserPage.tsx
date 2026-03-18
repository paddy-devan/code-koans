import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { loadProgress } from "../lib/persistence";
import { vegaKoans } from "../koans/vegaKoans";

export function VegaKoanBrowserPage() {
  const [completedKoanIds, setCompletedKoanIds] = useState<string[]>([]);

  useEffect(() => {
    void loadProgress().then((snapshot) => {
      setCompletedKoanIds(snapshot.completedKoanIds);
    });
  }, []);

  return (
    <section className="panel">
      <p className="eyebrow">Checkpoint 9</p>
      <h2>Vega Koan Browser</h2>
      <p>Select a koan and track completion through the persistence layer.</p>

      <ul className="koan-list">
        {vegaKoans.map((koan) => (
          <li key={koan.id} className="koan-list-item">
            <Link to={`/vega/koans/${koan.id}`} className="koan-link">
              <span className="koan-link-heading">
                <span className="koan-link-title">{koan.title}</span>
                {completedKoanIds.includes(koan.id) ? (
                  <span className="status-badge completed">Completed</span>
                ) : (
                  <span className="status-badge pending">Not completed</span>
                )}
              </span>
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
