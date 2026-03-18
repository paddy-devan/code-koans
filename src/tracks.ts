export type TrackId = "vega" | "regex";

export type TrackDefinition = {
  id: TrackId;
  name: string;
  summary: string;
  status: "implemented" | "planned";
};

export const trackDefinitions: TrackDefinition[] = [
  {
    id: "vega",
    name: "Vega",
    summary: "Discovery-based chart koans for learning raw Vega specs.",
    status: "implemented",
  },
  {
    id: "regex",
    name: "Regex",
    summary: "Future text-pattern koans using the same route and data shape.",
    status: "planned",
  },
];

export function getTrackPath(trackId: TrackId) {
  return `/${trackId}`;
}

export function getTrackKoansPath(trackId: TrackId) {
  return `${getTrackPath(trackId)}/koans`;
}

export function getTrackKoanPath(trackId: TrackId, koanId: string) {
  return `${getTrackKoansPath(trackId)}/${koanId}`;
}

export function getTrackDefinition(trackId: TrackId) {
  return trackDefinitions.find((track) => track.id === trackId);
}
