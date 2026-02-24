import { NavLink } from "react-router-dom";
import { getUserRole } from "../utils/roleCheck";
import { logout } from "../utils/logout";

export default function Navbar() {
  const role = getUserRole();

  return (
    <nav className="navbar">
      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>📊 Dashboard</NavLink>
        <NavLink to="/alerts" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>🚨 Alerts</NavLink>
        <NavLink to="/logs" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>📝 Logs</NavLink>
        <NavLink to="/incidents" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>🔴 Incidents</NavLink>
        {role === "ADMIN" && (
          <NavLink to="/audit-logs" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>📋 Audit Logs</NavLink>
        )}
      </div>
      <div className="nav-actions">
        <span className="nav-role">Role: {role}</span>
        <button onClick={logout} className="nav-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}
