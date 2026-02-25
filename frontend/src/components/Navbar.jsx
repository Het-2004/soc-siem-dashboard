import { NavLink } from "react-router-dom";
import { getUserRole } from "../utils/roleCheck";
import { logout } from "../utils/logout";

export default function Navbar() {
  const role = getUserRole();

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <span className="brand-icon">🛡️</span>
        <span className="brand-text">SOC Dashboard</span>
      </div>
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          <span className="nav-icon">📊</span> Dashboard
        </NavLink>
        <NavLink to="/alerts" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          <span className="nav-icon">🚨</span> Alerts
        </NavLink>
        <NavLink to="/logs" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          <span className="nav-icon">📝</span> Logs
        </NavLink>
        <NavLink to="/incidents" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          <span className="nav-icon">🔴</span> Incidents
        </NavLink>
        {role === "ADMIN" && (
          <NavLink to="/audit-logs" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            <span className="nav-icon">📋</span> Audit Logs
          </NavLink>
        )}
      </div>
      <div className="nav-actions">
        <span className="nav-role">👤 {role}</span>
        <button onClick={logout} className="nav-logout">
          🚪 Logout
        </button>
      </div>
    </nav>
  );
}
