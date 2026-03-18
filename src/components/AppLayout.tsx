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
        <div>
          <p className="eyebrow">Code Koans</p>
          <h1 className="site-title">Minimal learning tracks for technical tools.</h1>
        </div>
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
    </div>
  );
}
