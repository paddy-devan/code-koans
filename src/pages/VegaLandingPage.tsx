import { Link } from "react-router-dom";
import { getTrackDefinition, getTrackKoansPath } from "../tracks";

export function VegaLandingPage() {
  const track = getTrackDefinition("vega");

  return (
    <section className="panel">
      <p className="eyebrow">Checkpoint 12</p>
      <h2>{track?.name ?? "Vega"} Track</h2>
      <p>{track?.summary}</p>
      <p className="support-copy">
        This is the only implemented track right now. Other tracks can follow the same top-level
        route pattern later.
      </p>
      <p>
        <Link to={getTrackKoansPath("vega")} className="inline-link">
          Browse Vega koans
        </Link>
      </p>
    </section>
  );
}
