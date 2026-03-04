import { NavLink } from "react-router-dom";
import { getUserRole } from "../utils/roleCheck";
import { logout } from "../utils/logout";
import { useState, useEffect } from "react";

export default function Navbar() {
  const role = getUserRole();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (d) =>
    d.toLocaleTimeString("en-US", { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" });

  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <svg className="brand-icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ color: "var(--neon-cyan)" }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        <span className="brand-text">SOC COMMAND</span>
      </div>

      <div className="nav-links">
        <NavLink to="/" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`} end>
          <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
          </svg>
          Dashboard
        </NavLink>
        <NavLink to="/alerts" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          Alerts
        </NavLink>
        <NavLink to="/logs" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          Logs
        </NavLink>
        <NavLink to="/incidents" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
          <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          Incidents
        </NavLink>
        {role === "ADMIN" && (
          <NavLink to="/audit-logs" className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}>
            <svg className="nav-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            Audit
          </NavLink>
        )}
      </div>

      <div className="nav-actions">
        <div className="nav-threat-indicator">
          <span className="threat-pulse" />
          LIVE
        </div>
        <span className="nav-clock">{formatTime(time)}</span>
        <span className="nav-role">{role}</span>
        <button onClick={logout} className="nav-logout">
          Logout
        </button>
      </div>
    </nav>
  );
}
