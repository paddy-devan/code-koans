type ProgressSnapshot = {
  completedKoanIds: string[];
  attemptCounts: Record<string, number>;
};

type QueryResult<T> = {
  results: T[];
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
};

const DEVELOPMENT_USER_ID = "development-user";
const DEVELOPMENT_USER_NAME = "Development Learner";

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

async function getRequestUserId(db: DatabaseBinding) {
  const timestamp = new Date().toISOString();

  await db.batch([
    db
      .prepare(
        "INSERT INTO users (id, display_name, created_at, updated_at) VALUES (?1, ?2, ?3, ?3) ON CONFLICT(id) DO UPDATE SET updated_at = excluded.updated_at",
      )
      .bind(DEVELOPMENT_USER_ID, DEVELOPMENT_USER_NAME, timestamp),
  ]);

  return DEVELOPMENT_USER_ID;
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

    if (request.method === "GET" && url.pathname === "/api/progress") {
      const userId = await getRequestUserId(env.DB);

      return json(await buildProgressSnapshot(env.DB, userId));
    }

    if (request.method === "POST" && url.pathname === "/api/submissions") {
      const payload = (await request.json()) as { koanId?: unknown; passed?: unknown };

      if (typeof payload.koanId !== "string" || typeof payload.passed !== "boolean") {
        return json({ error: "Invalid submission payload." }, { status: 400 });
      }

      const timestamp = new Date().toISOString();
      const userId = await getRequestUserId(env.DB);

      await env.DB.batch([
        env.DB
          .prepare(
            "INSERT INTO user_submission_attempts (user_id, koan_id, passed, created_at) VALUES (?1, ?2, ?3, ?4)",
          )
          .bind(userId, payload.koanId, payload.passed ? 1 : 0, timestamp),
        ...(payload.passed
          ? [
              env.DB
                .prepare(
                  "INSERT INTO user_progress (user_id, koan_id, completed, completed_at) VALUES (?1, ?2, 1, ?3) ON CONFLICT(user_id, koan_id) DO UPDATE SET completed = 1, completed_at = excluded.completed_at",
                )
                .bind(userId, payload.koanId, timestamp),
            ]
          : []),
      ]);

      return json(await buildProgressSnapshot(env.DB, userId));
    }

    return json({ error: "Not found." }, { status: 404 });
  },
};
