type ProgressSnapshot = {
  completedKoanIds: string[];
  attemptCounts: Record<string, number>;
};

type QueryResult<T> = {
  results: T[];
};

type UserIdentity = {
  id: string;
  githubUsername: string | null;
  displayName: string | null;
  avatarUrl: string | null;
};

type D1Statement = {
  bind(...values: unknown[]): D1Statement;
  all<T>(): Promise<QueryResult<T>>;
};

type DatabaseBinding = {
  prepare(query: string): D1Statement;
  batch(statements: D1Statement[]): Promise<unknown>;
};

type WorkerEnv = {
  DB: DatabaseBinding;
  GITHUB_CLIENT_ID?: string;
  GITHUB_CLIENT_SECRET?: string;
};

const SESSION_COOKIE_NAME = "code_koans_session";
const OAUTH_STATE_COOKIE_NAME = "code_koans_oauth_state";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

function json(data: unknown, init?: ResponseInit) {
  return new Response(JSON.stringify(data), {
    ...init,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
      ...init?.headers,
    },
  });
}

function redirect(location: string, cookies: string[] = []) {
  const headers = new Headers({ Location: location });

  for (const cookie of cookies) {
    headers.append("Set-Cookie", cookie);
  }

  return new Response(null, { status: 302, headers });
}

function getCookie(request: Request, name: string) {
  const cookieHeader = request.headers.get("Cookie") ?? "";
  const cookies = cookieHeader.split(";").map((cookie) => cookie.trim());

  for (const cookie of cookies) {
    const separatorIndex = cookie.indexOf("=");

    if (separatorIndex === -1) {
      continue;
    }

    const cookieName = cookie.slice(0, separatorIndex);

    if (cookieName === name) {
      return decodeURIComponent(cookie.slice(separatorIndex + 1));
    }
  }

  return null;
}

function buildCookie(
  request: Request,
  name: string,
  value: string,
  options: { maxAgeSeconds: number },
) {
  const url = new URL(request.url);
  const parts = [
    `${name}=${encodeURIComponent(value)}`,
    "Path=/",
    `Max-Age=${options.maxAgeSeconds}`,
    "HttpOnly",
    "SameSite=Lax",
  ];

  if (url.protocol === "https:") {
    parts.push("Secure");
  }

  return parts.join("; ");
}

function clearCookie(request: Request, name: string) {
  return buildCookie(request, name, "", { maxAgeSeconds: 0 });
}

function createRandomToken() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  const binaryValue = String.fromCharCode(...bytes);

  return btoa(binaryValue).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

async function hashToken(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));

  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

async function getAuthenticatedUser(request: Request, db: DatabaseBinding) {
  const sessionToken = getCookie(request, SESSION_COOKIE_NAME);

  if (!sessionToken) {
    return null;
  }

  const sessionId = await hashToken(sessionToken);
  const sessionRows = await db
    .prepare(
      "SELECT users.id, users.github_username AS githubUsername, users.display_name AS displayName, users.avatar_url AS avatarUrl FROM sessions INNER JOIN users ON users.id = sessions.user_id WHERE sessions.id = ?1 AND sessions.expires_at > ?2 LIMIT 1",
    )
    .bind(sessionId, new Date().toISOString())
    .all<UserIdentity>();

  return sessionRows.results[0] ?? null;
}

function getRequiredUserResponse() {
  return json({ error: "Authentication required." }, { status: 401 });
}

async function createSession(db: DatabaseBinding, request: Request, userId: string) {
  const sessionToken = createRandomToken();
  const sessionId = await hashToken(sessionToken);
  const createdAt = new Date();
  const expiresAt = new Date(createdAt.getTime() + SESSION_MAX_AGE_SECONDS * 1000);

  await db.batch([
    db
      .prepare("INSERT INTO sessions (id, user_id, expires_at, created_at) VALUES (?1, ?2, ?3, ?4)")
      .bind(sessionId, userId, expiresAt.toISOString(), createdAt.toISOString()),
  ]);

  return buildCookie(request, SESSION_COOKIE_NAME, sessionToken, {
    maxAgeSeconds: SESSION_MAX_AGE_SECONDS,
  });
}

async function clearSession(db: DatabaseBinding, request: Request) {
  const sessionToken = getCookie(request, SESSION_COOKIE_NAME);

  if (sessionToken) {
    await db.batch([
      db.prepare("DELETE FROM sessions WHERE id = ?1").bind(await hashToken(sessionToken)),
    ]);
  }

  return clearCookie(request, SESSION_COOKIE_NAME);
}

async function upsertGitHubUser(db: DatabaseBinding, githubUser: GitHubUser) {
  const timestamp = new Date().toISOString();
  const userId = `github:${githubUser.id}`;

  await db.batch([
    db
      .prepare(
        "INSERT INTO users (id, github_user_id, github_username, display_name, avatar_url, created_at, updated_at) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?6) ON CONFLICT(id) DO UPDATE SET github_user_id = excluded.github_user_id, github_username = excluded.github_username, display_name = excluded.display_name, avatar_url = excluded.avatar_url, updated_at = excluded.updated_at",
      )
      .bind(
        userId,
        String(githubUser.id),
        githubUser.login,
        githubUser.name,
        githubUser.avatar_url,
        timestamp,
      ),
  ]);

  return userId;
}

type GitHubUser = {
  id: number;
  login: string;
  name: string | null;
  avatar_url: string | null;
};

async function exchangeGitHubCode(env: WorkerEnv, code: string, redirectUri: string) {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.GITHUB_CLIENT_ID ?? "",
      client_secret: env.GITHUB_CLIENT_SECRET ?? "",
      code,
      redirect_uri: redirectUri,
    }),
  });
  const payload = (await response.json()) as { access_token?: unknown; error?: unknown };

  if (!response.ok || typeof payload.access_token !== "string") {
    throw new Error(
      typeof payload.error === "string" ? payload.error : "GitHub token exchange failed.",
    );
  }

  return payload.access_token;
}

async function fetchGitHubUser(accessToken: string): Promise<GitHubUser> {
  const response = await fetch("https://api.github.com/user", {
    headers: {
      Accept: "application/vnd.github+json",
      Authorization: `Bearer ${accessToken}`,
      "User-Agent": "code-koans",
      "X-GitHub-Api-Version": "2022-11-28",
    },
  });
  const payload = (await response.json()) as Partial<GitHubUser>;

  if (!response.ok || typeof payload.id !== "number" || typeof payload.login !== "string") {
    throw new Error("GitHub user lookup failed.");
  }

  return {
    id: payload.id,
    login: payload.login,
    name: typeof payload.name === "string" ? payload.name : null,
    avatar_url: typeof payload.avatar_url === "string" ? payload.avatar_url : null,
  };
}

async function buildProgressSnapshot(
  db: DatabaseBinding,
  userId: string,
): Promise<ProgressSnapshot> {
  const completedRows = await db
    .prepare(
      "SELECT koan_id FROM user_progress WHERE user_id = ?1 AND completed = 1 ORDER BY koan_id ASC",
    )
    .bind(userId)
    .all<{ koan_id: string }>();
  const attemptRows = await db
    .prepare(
      "SELECT koan_id, COUNT(*) AS attempt_count FROM user_submission_attempts WHERE user_id = ?1 GROUP BY koan_id ORDER BY koan_id ASC",
    )
    .bind(userId)
    .all<{ koan_id: string; attempt_count: number }>();

  return {
    completedKoanIds: completedRows.results.map((row) => row.koan_id),
    attemptCounts: Object.fromEntries(
      attemptRows.results.map((row) => [row.koan_id, Number(row.attempt_count)]),
    ),
  };
}

export default {
  async fetch(request: Request, env: WorkerEnv): Promise<Response> {
    const url = new URL(request.url);

    if (request.method === "OPTIONS") {
      return json(null, { status: 204 });
    }

    if (request.method === "GET" && url.pathname === "/auth/login") {
      if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
        return json({ error: "GitHub OAuth is not configured." }, { status: 503 });
      }

      const state = createRandomToken();
      const redirectUri = `${url.origin}/auth/callback`;
      const authorizeUrl = new URL("https://github.com/login/oauth/authorize");

      authorizeUrl.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
      authorizeUrl.searchParams.set("redirect_uri", redirectUri);
      authorizeUrl.searchParams.set("state", state);
      authorizeUrl.searchParams.set("scope", "read:user");

      return redirect(authorizeUrl.toString(), [
        buildCookie(request, OAUTH_STATE_COOKIE_NAME, state, { maxAgeSeconds: 10 * 60 }),
      ]);
    }

    if (request.method === "GET" && url.pathname === "/auth/callback") {
      const expectedState = getCookie(request, OAUTH_STATE_COOKIE_NAME);
      const state = url.searchParams.get("state");
      const code = url.searchParams.get("code");

      if (!expectedState || !state || expectedState !== state || !code) {
        return json({ error: "Invalid GitHub OAuth callback." }, { status: 400 });
      }

      try {
        const accessToken = await exchangeGitHubCode(env, code, `${url.origin}/auth/callback`);
        const githubUser = await fetchGitHubUser(accessToken);
        const userId = await upsertGitHubUser(env.DB, githubUser);
        const sessionCookie = await createSession(env.DB, request, userId);

        return redirect("/profile", [
          sessionCookie,
          clearCookie(request, OAUTH_STATE_COOKIE_NAME),
        ]);
      } catch {
        return json({ error: "GitHub login failed." }, { status: 502 });
      }
    }

    if (request.method === "POST" && url.pathname === "/auth/logout") {
      return json(
        { ok: true },
        {
          headers: {
            "Set-Cookie": await clearSession(env.DB, request),
          },
        },
      );
    }

    if (request.method === "GET" && url.pathname === "/api/me") {
      const user = await getAuthenticatedUser(request, env.DB);

      return json({
        authenticated: Boolean(user),
        user,
      });
    }

    if (request.method === "GET" && url.pathname === "/api/progress") {
      const user = await getAuthenticatedUser(request, env.DB);

      if (!user) {
        return getRequiredUserResponse();
      }

      return json(await buildProgressSnapshot(env.DB, user.id));
    }

    if (request.method === "POST" && url.pathname === "/api/submissions") {
      const payload = (await request.json()) as { koanId?: unknown; passed?: unknown };

      if (typeof payload.koanId !== "string" || typeof payload.passed !== "boolean") {
        return json({ error: "Invalid submission payload." }, { status: 400 });
      }

      const timestamp = new Date().toISOString();
      const user = await getAuthenticatedUser(request, env.DB);

      if (!user) {
        return getRequiredUserResponse();
      }

      await env.DB.batch([
        env.DB
          .prepare(
            "INSERT INTO user_submission_attempts (user_id, koan_id, passed, created_at) VALUES (?1, ?2, ?3, ?4)",
          )
          .bind(user.id, payload.koanId, payload.passed ? 1 : 0, timestamp),
        ...(payload.passed
          ? [
              env.DB
                .prepare(
                  "INSERT INTO user_progress (user_id, koan_id, completed, completed_at) VALUES (?1, ?2, 1, ?3) ON CONFLICT(user_id, koan_id) DO UPDATE SET completed = 1, completed_at = excluded.completed_at",
                )
                .bind(user.id, payload.koanId, timestamp),
            ]
          : []),
      ]);

      return json(await buildProgressSnapshot(env.DB, user.id));
    }

    return json({ error: "Not found." }, { status: 404 });
  },
};
