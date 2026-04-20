import { useEffect, useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import { getLoginUrl, loadCurrentUser, logout, type AuthState } from "../lib/auth";
import { mergeCachedProgressToAccount } from "../lib/persistence";
import { getTrackKoanPath, getTrackKoansPath, getTrackPath } from "../tracks";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: getTrackPath("vega"), label: "Vega" },
  { to: getTrackKoansPath("vega"), label: "Koans" },
  { to: getTrackKoanPath("vega", "bar-chart-basics"), label: "Koan Page" },
  { to: "/profile", label: "Profile" },
];

export function AppLayout() {
  const [authState, setAuthState] = useState<AuthState>({
    authenticated: false,
    user: null,
  });

  useEffect(() => {
    void loadCurrentUser().then((nextAuthState) => {
      setAuthState(nextAuthState);

      if (nextAuthState.authenticated) {
        void mergeCachedProgressToAccount();
      }
    });
  }, []);

  async function handleLogout() {
    await logout();
    setAuthState({ authenticated: false, user: null });
  }

  return (
    <div className="app-shell">
      <header className="site-header">
        <NavLink to="/" className="site-brand" aria-label="Code Koans home">
          <img className="site-logo" src="/logo-primary.svg" alt="Code Koans" />
        </NavLink>
        <nav aria-label="Primary">
          <ul className="nav-list">
            {navItems.map((item) => (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => (isActive ? "nav-link active" : "nav-link")}
                >
                  {item.label}
                </NavLink>
              </li>
            ))}
            <li className="auth-nav-item">
              {authState.authenticated ? (
                <>
                  <span className="auth-label">
                    {authState.user?.githubUsername ?? authState.user?.displayName ?? "Signed in"}
                  </span>
                  <button className="nav-link nav-button" type="button" onClick={handleLogout}>
                    Sign out
                  </button>
                </>
              ) : (
                <a className="nav-link" href={getLoginUrl()}>
                  Sign in
                </a>
              )}
            </li>
          </ul>
        </nav>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>

      <footer className="site-footer">
        <img className="site-footer-logo" src="/tagline-footer.svg" alt="Code Koans" />
        <a
          className="footer-link"
          href="https://github.com/paddy-devan/code-koans"
          target="_blank"
          rel="noreferrer"
        >
          <svg className="footer-link-icon" viewBox="0 0 16 16" aria-hidden="true">
            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82A7.65 7.65 0 0 1 8 3.87c.68 0 1.36.09 2 .26 1.53-1.03 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.06-1.86 3.75-3.64 3.95.29.25.55.74.55 1.49 0 1.07-.01 1.93-.01 2.19 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
          </svg>
          <span>paddy-devan/code-koans</span>
        </a>
      </footer>
    </div>
  );
}
