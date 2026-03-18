const DRAFT_STORAGE_PREFIX = "code-koans.vega.draft.";

function getDraftStorageKey(koanId: string) {
  return `${DRAFT_STORAGE_PREFIX}${koanId}`;
}

export function getKoanDraft(koanId: string) {
  if (typeof window === "undefined") {
    return null;
  }

  const draft = window.localStorage.getItem(getDraftStorageKey(koanId));
  return draft ?? null;
}

export function saveKoanDraft(koanId: string, draft: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(getDraftStorageKey(koanId), draft);
}

export function clearKoanDraft(koanId: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(getDraftStorageKey(koanId));
}
