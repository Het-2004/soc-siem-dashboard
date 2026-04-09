import { NavLink } from "react-router-dom";
import { getUserRole, getUserName } from "../utils/roleCheck";
import { logout } from "../utils/logout";
import { useState, useEffect } from "react";

const NAV_ITEMS = [
  {
    section: "MONITORING",
    links: [
      {
        to: "/",
        label: "Dashboard",
        end: true,
        icon: (
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" />
            <rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" />
          </svg>
        ),
      },
      {
        to: "/alerts",
        label: "Alerts",
        icon: (
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
        ),
      },
      {
        to: "/logs",
        label: "Log Explorer",
        icon: (
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
          </svg>
        ),
      },
    ],
  },
  {
    section: "RESPONSE",
    links: [
      {
        to: "/incidents",
        label: "Incidents",
        icon: (
          <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
        ),
      },
    ],
  },
];

const ADMIN_ITEMS = {
  section: "ADMIN",
  links: [
    {
      to: "/audit-logs",
      label: "Audit Logs",
      icon: (
        <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0110 0v4" />
        </svg>
      ),
    },
  ],
};

export default function Navbar() {
  const role = getUserRole();
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const t = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const formatTime = (d) =>
    d.toLocaleTimeString("en-US", { hour12: false });

  const formatDate = (d) =>
    d.toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" });

  const sections = role === "ADMIN" ? [...NAV_ITEMS, ADMIN_ITEMS] : NAV_ITEMS;
  const userInitials = role ? role.slice(0, 2).toUpperCase() : "SC";

  return (
    <aside className="sidebar">
      {/* Brand */}
      <div className="sidebar-brand">
        <div className="sidebar-brand-icon">
          <img
            src="/SOCs.svg"
            alt="SOC Logo"
            style={{ width: "100%", height: "100%", objectFit: "contain", mixBlendMode: "screen", filter: "drop-shadow(0 0 6px rgba(0,212,255,0.8)) brightness(1.1)" }}
          />
        </div>
        <div className="sidebar-brand-text">
          <span className="sidebar-brand-title">SOC COMMAND</span>
          <span className="sidebar-brand-sub">Security Operations</span>
        </div>
      </div>

      {/* Status row */}
      <div className="sidebar-status">
        <span className="sidebar-status-item live">
          <span className="status-pulse red" />
          LIVE MONITOR
        </span>
        <span className="sidebar-status-item ok">
          <span className="status-pulse green" />
          SECURE
        </span>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {sections.map((section) => (
          <div key={section.section}>
            <div className="sidebar-section-label">{section.section}</div>
            {section.links.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                end={link.end}
                className={({ isActive }) => `nav-link${isActive ? " active" : ""}`}
              >
                {link.icon}
                {link.label}
              </NavLink>
            ))}
          </div>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="sidebar-clock">
          {formatDate(time)} &nbsp;·&nbsp; {formatTime(time)}
        </div>
        <div className="sidebar-user">
          <div className="sidebar-avatar">{userInitials}</div>
          <div className="sidebar-user-info">
            <span className="sidebar-user-name">{getUserName()}</span>
            <span className="sidebar-user-role">{role}</span>
          </div>
        </div>
        <button className="sidebar-logout" onClick={logout}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Sign Out
        </button>
      </div>
    </aside>
  );
}
