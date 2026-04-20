import { useEffect, useMemo, useState } from "react";
import { getLoginUrl, loadCurrentUser, type AuthState } from "../lib/auth";
import { getCachedProgress, loadProgress } from "../lib/persistence";
import { vegaKoans } from "../koans/vegaKoans";

export function ProfilePage() {
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    user: null,
  });
  const [completedKoanIds, setCompletedKoanIds] = useState<string[]>([]);
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});

  useEffect(() => {
    void loadCurrentUser().then(setAuthState);

    const cachedProgress = getCachedProgress();
    setCompletedKoanIds(cachedProgress.completedKoanIds);
    setAttemptCounts(cachedProgress.attemptCounts);

    void loadProgress().then((snapshot) => {
      setCompletedKoanIds(snapshot.completedKoanIds);
      setAttemptCounts(snapshot.attemptCounts);
    });
  }, []);

  const totalAttempts = useMemo(
    () => Object.values(attemptCounts).reduce((sum, count) => sum + count, 0),
    [attemptCounts],
  );

  return (
    <section className="panel">
      <h2>Profile</h2>
      <p className="support-copy">
        {authState.authenticated
          ? "Account-backed learner profile."
          : "Local learner profile until you sign in."}
      </p>

      <section className="profile-identity">
        <p className="eyebrow">Identity</p>
        <div className="profile-identity-row">
          {authState.user?.avatarUrl ? (
            <img className="profile-avatar" src={authState.user.avatarUrl} alt="" />
          ) : null}
          <div>
            <h3>
              {authState.authenticated
                ? authState.user?.displayName ?? authState.user?.githubUsername ?? "Signed in"
                : "Local Learner"}
            </h3>
            <p className="support-copy">
              {authState.authenticated
                ? `Signed in with GitHub${
                    authState.user?.githubUsername ? ` as ${authState.user.githubUsername}` : ""
                  }.`
                : "Sign in to attach progress to an account."}
            </p>
          </div>
        </div>
        {!authState.authenticated ? (
          <a className="secondary-button profile-sign-in-link" href={getLoginUrl()}>
            Sign in with GitHub
          </a>
        ) : null}
      </section>

      <div className="profile-stats">
        <section className="profile-stat-card">
          <p className="eyebrow">Completed Koans</p>
          <p className="profile-stat-value">{completedKoanIds.length}</p>
        </section>
        <section className="profile-stat-card">
          <p className="eyebrow">Submission Attempts</p>
          <p className="profile-stat-value">{totalAttempts}</p>
        </section>
        <section className="profile-stat-card">
          <p className="eyebrow">Track</p>
          <p className="profile-stat-value">Vega</p>
        </section>
      </div>

      <section className="profile-summary-panel">
        <div className="result-header">
          <h3>Per-Koan Status</h3>
          <p className="support-copy">
            Completion and attempt counts from the current persisted progress snapshot.
          </p>
        </div>
        <ul className="profile-koan-list">
          {vegaKoans.map((koan) => {
            const isCompleted = completedKoanIds.includes(koan.id);
            const attemptCount = attemptCounts[koan.id] ?? 0;

            return (
              <li key={koan.id} className="profile-koan-item">
                <div>
                  <p className="profile-koan-title">{koan.title}</p>
                  <p className="koan-link-meta">
                    {koan.difficulty} · {koan.topic}
                  </p>
                </div>
                <div className="profile-koan-meta">
                  <span className={isCompleted ? "status-badge completed" : "status-badge pending"}>
                    {isCompleted ? "Completed" : "Not completed"}
                  </span>
                  <span className="profile-attempt-count">
                    {attemptCount} {attemptCount === 1 ? "attempt" : "attempts"}
                  </span>
                </div>
              </li>
            );
          })}
        </ul>
      </section>
    </section>
  );
}
