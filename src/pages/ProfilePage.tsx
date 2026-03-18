import { useEffect, useMemo, useState } from "react";
import { getCachedProgress, loadProgress } from "../lib/persistence";
import { vegaKoans } from "../koans/vegaKoans";

export function ProfilePage() {
  const [completedKoanIds, setCompletedKoanIds] = useState<string[]>([]);
  const [attemptCounts, setAttemptCounts] = useState<Record<string, number>>({});

  useEffect(() => {
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
      <p className="eyebrow">Checkpoint 10</p>
      <h2>Profile</h2>
      <p className="support-copy">Local learner profile for the current browser session.</p>

      <section className="profile-identity">
        <p className="eyebrow">Identity</p>
        <h3>Local Learner</h3>
        <p className="support-copy">
          Placeholder identity until a real account system exists.
        </p>
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
