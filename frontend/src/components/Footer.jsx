export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-content">
        <div className="footer-section">
          <h3>SOC / SIEM Dashboard</h3>
          <p>Real-time security monitoring & incident management</p>
          <div className="footer-status">
            <span className="status-dot" />
            All systems operational
          </div>
        </div>
        <div className="footer-section">
          <h4>Quick Links</h4>
          <p>Dashboard • Alerts • Logs • Incidents</p>
        </div>
        <div className="footer-section">
          <h4>System Info</h4>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem" }}>
            © 2026 Security Operations Center
          </p>
          <p style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
            v2.0.0 • Encrypted • Protected
          </p>
        </div>
      </div>
    </footer>
  );
}
