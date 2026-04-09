export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-left">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
        SOC / SIEM Dashboard &nbsp;·&nbsp; v2.0.0
      </div>
      <div className="footer-center">
        <span className="status-dot" />
        All systems operational
      </div>
      <div className="footer-right">
        © 2026 Security Operations Center &nbsp;·&nbsp; Encrypted &amp; Protected
      </div>
    </footer>
  );
}
