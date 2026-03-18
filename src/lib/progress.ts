export type ProgressSnapshot = {
  completedKoanIds: string[];
  attemptCounts: Record<string, number>;
};

const STORAGE_KEY = "code-koans.progress-cache.v1";

function normalizeSnapshot(value: unknown): ProgressSnapshot {
  const record = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  const completedKoanIds = Array.isArray(record.completedKoanIds)
    ? record.completedKoanIds.filter((item): item is string => typeof item === "string")
    : [];
  const attemptCountsRecord =
    typeof record.attemptCounts === "object" && record.attemptCounts !== null
      ? (record.attemptCounts as Record<string, unknown>)
      : {};

  const attemptCounts = Object.fromEntries(
    Object.entries(attemptCountsRecord).filter(
      (entry): entry is [string, number] => typeof entry[1] === "number",
    ),
  );

  return {
    completedKoanIds,
    attemptCounts,
  };
}

export function getEmptyProgressSnapshot(): ProgressSnapshot {
  return {
    completedKoanIds: [],
    attemptCounts: {},
  };
}

export function readProgressSnapshot() {
  if (typeof window === "undefined") {
    return getEmptyProgressSnapshot();
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return getEmptyProgressSnapshot();
  }

  try {
    return normalizeSnapshot(JSON.parse(rawValue));
  } catch {
    return getEmptyProgressSnapshot();
  }
}

export function writeProgressSnapshot(snapshot: ProgressSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot));
}

export function applySubmissionToSnapshot(
  snapshot: ProgressSnapshot,
  koanId: string,
  passed: boolean,
): ProgressSnapshot {
  return {
    completedKoanIds: passed
      ? Array.from(new Set([...snapshot.completedKoanIds, koanId]))
      : snapshot.completedKoanIds,
    attemptCounts: {
      ...snapshot.attemptCounts,
      [koanId]: (snapshot.attemptCounts[koanId] ?? 0) + 1,
    },
  };
}
