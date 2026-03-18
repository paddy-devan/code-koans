import { Link } from "react-router-dom";
import { getTrackKoansPath, getTrackPath, trackDefinitions } from "../tracks";

export function HomePage() {
  return (
    <section className="panel">
      <p className="eyebrow">Checkpoint 12</p>
      <h2>Tracks</h2>
      <p className="support-copy">
        The app now has an explicit track concept. Vega is implemented; other tracks can follow the
        same route shape later.
      </p>

      <div className="track-grid">
        {trackDefinitions.map((track) => (
          <section key={track.id} className="track-card">
            <p className="eyebrow">{track.status === "implemented" ? "Available" : "Planned"}</p>
            <h3>{track.name}</h3>
            <p>{track.summary}</p>
            <p className="support-copy">Base route: `{getTrackPath(track.id)}`</p>
            {track.status === "implemented" ? (
              <p>
                <Link to={getTrackKoansPath(track.id)} className="inline-link">
                  Open {track.name} koans
                </Link>
              </p>
            ) : (
              <p className="support-copy">
                Future route shape will follow `{getTrackKoansPath(track.id)}`.
              </p>
            )}
          </section>
        ))}
      </div>
    </section>
  );
}
