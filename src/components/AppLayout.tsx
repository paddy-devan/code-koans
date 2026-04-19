import { NavLink, Outlet } from "react-router-dom";
import { getTrackKoanPath, getTrackKoansPath, getTrackPath } from "../tracks";

const navItems = [
  { to: "/", label: "Home", end: true },
  { to: getTrackPath("vega"), label: "Vega" },
  { to: getTrackKoansPath("vega"), label: "Koans" },
  { to: getTrackKoanPath("vega", "bar-chart-basics"), label: "Koan Page" },
  { to: "/profile", label: "Profile" },
];

export function AppLayout() {
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
          </ul>
        </nav>
      </header>

      <main className="page-shell">
        <Outlet />
      </main>

      <footer className="site-footer">
        <img className="site-footer-logo" src="/tagline-footer.svg" alt="Code Koans" />
        <span>Vega koans</span>
      </footer>
    </div>
  );
}
