import { useParams } from "react-router-dom";
import { PlaceholderPage } from "../components/PlaceholderPage";

export function VegaKoanPage() {
  const { koanId } = useParams();

  return (
    <PlaceholderPage
      title="Vega Koan Page"
      description={`Placeholder route for koan "${koanId ?? "unknown"}". Real koan loading is intentionally deferred to Checkpoint 2.`}
    />
  );
}
