export type AuthUser = {
  id: string;
  githubUsername: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

export type AuthState = {
  authenticated: boolean;
  user: AuthUser | null;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? "";

function getApiUrl(path: string) {
  return `${API_BASE_URL}${path}`;
}

export function getLoginUrl() {
  return getApiUrl("/auth/login");
}

export async function loadCurrentUser(): Promise<AuthState> {
  const response = await fetch(getApiUrl("/api/me"), {
    credentials: "include",
  });

  if (!response.ok) {
    return { authenticated: false, user: null };
  }

  const payload = (await response.json()) as Partial<AuthState>;

  return {
    authenticated: Boolean(payload.authenticated),
    user:
      typeof payload.user === "object" && payload.user !== null
        ? {
            id: typeof payload.user.id === "string" ? payload.user.id : "",
            githubUsername:
              typeof payload.user.githubUsername === "string" ? payload.user.githubUsername : null,
            displayName:
              typeof payload.user.displayName === "string" ? payload.user.displayName : null,
            avatarUrl: typeof payload.user.avatarUrl === "string" ? payload.user.avatarUrl : null,
          }
        : null,
  };
}

export async function logout() {
  await fetch(getApiUrl("/auth/logout"), {
    method: "POST",
    credentials: "include",
  });
}
