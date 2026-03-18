const STORAGE_KEY = "code-koans.completed-vega-koans";

function readStorage() {
  if (typeof window === "undefined") {
    return [];
  }

  const rawValue = window.localStorage.getItem(STORAGE_KEY);

  if (!rawValue) {
    return [];
  }

  try {
    const parsedValue = JSON.parse(rawValue);
    return Array.isArray(parsedValue)
      ? parsedValue.filter((value): value is string => typeof value === "string")
      : [];
  } catch {
    return [];
  }
}

export function getCompletedKoanIds() {
  return readStorage();
}

export function isKoanCompleted(koanId: string) {
  return readStorage().includes(koanId);
}

export function markKoanCompleted(koanId: string) {
  if (typeof window === "undefined") {
    return;
  }

  const nextCompletedKoans = Array.from(new Set([...readStorage(), koanId]));
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(nextCompletedKoans));
}
