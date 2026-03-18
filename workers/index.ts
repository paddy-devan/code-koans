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

async function buildProgressSnapshot(db: DatabaseBinding): Promise<ProgressSnapshot> {
  const completedRows = await db
    .prepare("SELECT koan_id FROM progress WHERE completed = 1 ORDER BY koan_id ASC")
    .all<{ koan_id: string }>();
  const attemptRows = await db
    .prepare(
      "SELECT koan_id, COUNT(*) AS attempt_count FROM submission_attempts GROUP BY koan_id ORDER BY koan_id ASC",
    )
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
      return json(await buildProgressSnapshot(env.DB));
    }

    if (request.method === "POST" && url.pathname === "/api/submissions") {
      const payload = (await request.json()) as { koanId?: unknown; passed?: unknown };

      if (typeof payload.koanId !== "string" || typeof payload.passed !== "boolean") {
        return json({ error: "Invalid submission payload." }, { status: 400 });
      }

      const timestamp = new Date().toISOString();

      await env.DB.batch([
        env.DB
          .prepare(
            "INSERT INTO submission_attempts (koan_id, passed, created_at) VALUES (?1, ?2, ?3)",
          )
          .bind(payload.koanId, payload.passed ? 1 : 0, timestamp),
        ...(payload.passed
          ? [
              env.DB
                .prepare(
                  "INSERT INTO progress (koan_id, completed, completed_at) VALUES (?1, 1, ?2) ON CONFLICT(koan_id) DO UPDATE SET completed = 1, completed_at = excluded.completed_at",
                )
                .bind(payload.koanId, timestamp),
            ]
          : []),
      ]);

      return json(await buildProgressSnapshot(env.DB));
    }

    return json({ error: "Not found." }, { status: 404 });
  },
};
