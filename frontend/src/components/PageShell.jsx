import Navbar from "./Navbar";
import Footer from "./Footer";

/**
 * PageShell — wraps every protected page with sidebar + topbar + footer.
 */
export default function PageShell({ title, subtitle, children, actions }) {
  return (
    <div className="app-shell">
      <Navbar />
      <div className="main-content">
        {/* Top bar */}
        <header className="topbar">
          <div className="topbar-left">
            <div className="topbar-breadcrumb">
              <span>SOC</span>
              <span className="topbar-breadcrumb-sep">/</span>
              <span className="topbar-page-title">{title}</span>
            </div>
            {subtitle && (
              <span style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginLeft: "0.75rem", fontFamily: "var(--font-mono)" }}>
                — {subtitle}
              </span>
            )}
          </div>
          <div className="topbar-right">
            <span className="topbar-indicator threat">
              <span className="status-pulse red" style={{ width: 6, height: 6, borderRadius: "50%", display: "inline-block", background: "var(--severity-high)", animation: "pulse-anim 1.2s ease-in-out infinite" }} />
              THREAT MONITOR ACTIVE
            </span>
            {actions}
          </div>
        </header>

        {/* Page content */}
        <main className="page">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
}
