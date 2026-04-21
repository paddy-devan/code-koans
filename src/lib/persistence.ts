import {
  applySubmissionToSnapshot,
  getEmptyProgressSnapshot,
  readProgressSnapshot,
  type ProgressSnapshot,
  writeProgressSnapshot,
} from "./progress";

type SubmissionPayload = {
  koanId: string;
  passed: boolean;
};

export type ProgressSource = "remote" | "local" | "unauthenticated";

export type ProgressLoadResult = {
  snapshot: ProgressSnapshot;
  source: ProgressSource;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";
const MERGED_USER_IDS_KEY = "code-koans.progress-merged-user-ids.v1";

function getApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

async function parseProgressResponse(response: Response) {
  if (!response.ok) {
    throw new Error(`Request failed with status ${response.status}.`);
  }

  const payload = (await response.json()) as Partial<ProgressSnapshot>;
  const snapshot: ProgressSnapshot = {
    completedKoanIds: Array.isArray(payload.completedKoanIds)
      ? payload.completedKoanIds.filter((item): item is string => typeof item === "string")
      : [],
    attemptCounts:
      typeof payload.attemptCounts === "object" && payload.attemptCounts !== null
        ? Object.fromEntries(
            Object.entries(payload.attemptCounts).filter(
              (entry): entry is [string, number] => typeof entry[1] === "number",
            ),
          )
        : {},
  };

  writeProgressSnapshot(snapshot);
  return snapshot;
}

export async function loadProgress(): Promise<ProgressLoadResult> {
  try {
    const response = await fetch(getApiUrl("/api/progress"), {
      credentials: "include",
    });

    if (response.status === 401) {
      return {
        snapshot: readProgressSnapshot(),
        source: "unauthenticated",
      };
    }

    return {
      snapshot: await parseProgressResponse(response),
      source: "remote",
    };
  } catch {
    return {
      snapshot: readProgressSnapshot(),
      source: "local",
    };
  }
}

export async function recordSubmissionAttempt(payload: SubmissionPayload) {
  try {
    const response = await fetch(getApiUrl("/api/submissions"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return await parseProgressResponse(response);
  } catch {
    const currentSnapshot = readProgressSnapshot();
    const nextSnapshot = applySubmissionToSnapshot(currentSnapshot, payload.koanId, payload.passed);
    writeProgressSnapshot(nextSnapshot);
    return nextSnapshot;
  }
}

export async function mergeCachedProgressToAccount() {
  const cachedProgress = readProgressSnapshot();

  try {
    const response = await fetch(getApiUrl("/api/progress/merge"), {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cachedProgress),
    });

    if (response.status === 401) {
      return {
        snapshot: cachedProgress,
        source: "unauthenticated" as const,
      };
    }

    return {
      snapshot: await parseProgressResponse(response),
      source: "remote" as const,
    };
  } catch {
    return {
      snapshot: cachedProgress,
      source: "local" as const,
    };
  }
}

function readMergedUserIds() {
  if (typeof window === "undefined") {
    return new Set<string>();
  }

  const rawValue = window.localStorage.getItem(MERGED_USER_IDS_KEY);

  if (!rawValue) {
    return new Set<string>();
  }

  try {
    const value = JSON.parse(rawValue);

    return new Set(
      Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : [],
    );
  } catch {
    return new Set<string>();
  }
}

function writeMergedUserIds(userIds: Set<string>) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(MERGED_USER_IDS_KEY, JSON.stringify(Array.from(userIds)));
}

export async function syncAccountProgress(userId: string) {
  const mergedUserIds = readMergedUserIds();

  if (mergedUserIds.has(userId)) {
    return loadProgress();
  }

  const result = await mergeCachedProgressToAccount();

  if (result.source === "remote") {
    mergedUserIds.add(userId);
    writeMergedUserIds(mergedUserIds);
  }

  return result;
}

export function getCachedProgress() {
  return typeof window === "undefined" ? getEmptyProgressSnapshot() : readProgressSnapshot();
}
