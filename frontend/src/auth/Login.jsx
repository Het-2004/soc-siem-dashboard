import { useState, useEffect } from "react";
import api from "../api/api";
import "../styles/auth.css";
import { useTransition } from "../context/TransitionContext";

/* ── Animated threat counter digits ────────────────────────── */
function AnimatedCounter({ target, duration = 2000, suffix = "" }) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = Math.ceil(target / (duration / 16));
    const timer = setInterval(() => {
      start = Math.min(start + step, target);
      setVal(start);
      if (start >= target) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return <>{val.toLocaleString()}{suffix}</>;
}

/* ── Live ticker items rolling in the left panel ────────────── */
const TICKER_EVENTS = [
  { sev: "HIGH", ip: "185.220.101.47", msg: "SSH brute-force detected" },
  { sev: "HIGH", ip: "91.108.4.220", msg: "Malware C2 communication" },
  { sev: "MEDIUM", ip: "45.129.33.66", msg: "Port scan — 1024 ports probed" },
  { sev: "HIGH", ip: "194.165.16.78", msg: "SQL injection attempt blocked" },
  { sev: "MEDIUM", ip: "103.21.244.0", msg: "DDoS traffic mitigated" },
  { sev: "LOW", ip: "198.51.100.22", msg: "Unusual outbound on port 4444" },
  { sev: "HIGH", ip: "5.8.18.236", msg: "Ransomware payload intercepted" },
  { sev: "MEDIUM", ip: "79.141.162.54", msg: "Authentication bypass attempt" },
];

const SEV_STYLE = {
  HIGH: { color: "#ff3366", bg: "rgba(255,51,102,0.12)", border: "rgba(255,51,102,0.3)" },
  MEDIUM: { color: "#ff9f43", bg: "rgba(255,159,67,0.12)", border: "rgba(255,159,67,0.3)" },
  LOW: { color: "#00ff88", bg: "rgba(0,255,136,0.08)", border: "rgba(0,255,136,0.2)" },
};


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [tickerIdx, setTickerIdx] = useState(0);
  const [timeStr, setTimeStr] = useState("");
  const { triggerTransition } = useTransition();

  /* Live clock */
  useEffect(() => {
    const tick = () => setTimeStr(new Date().toLocaleTimeString("en-US", { hour12: false }));
    tick();
    const id = setInterval(tick, 1000);
    return () => clearInterval(id);
  }, []);

  /* Ticker scroll */
  useEffect(() => {
    const id = setInterval(() => setTickerIdx(i => (i + 1) % TICKER_EVENTS.length), 2800);
    return () => clearInterval(id);
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      const res = await api.post("/auth/login", { email, password });
      // Store both tokens — accessToken as "token" for ProtectedRoute compat
      localStorage.setItem("token", res.data.accessToken);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      // Store user info for display in Navbar
      if (res.data.user) {
        localStorage.setItem("userRole", res.data.user.role);
        localStorage.setItem("userName", res.data.user.name);
      }
      triggerTransition();
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed. Check credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true); setError("");
    try {
      await api.post("/auth/register", { name, email, password });
      /* Signal global overlay + navigation in App.jsx */
      triggerTransition();
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const visibleEvents = Array.from({ length: 5 }, (_, i) =>
    TICKER_EVENTS[(tickerIdx + i) % TICKER_EVENTS.length]
  );

  return (
    <div className="auth-split">

      {/* ── LEFT PANEL ──────────────────────────────────────── */}
      <div className="auth-left">
        {/* Glowing orbs (decorative) */}
        <div className="auth-orb auth-orb-1" />
        <div className="auth-orb auth-orb-2" />
        <div className="auth-orb auth-orb-3" />

        {/* Brand */}
        <div className="auth-brand-row">
          <div className="auth-brand-icon">
            <img
              src="/SOCs.svg"
              alt="SOC Logo"
              style={{ width: "28px", height: "28px", objectFit: "contain", mixBlendMode: "screen", filter: "drop-shadow(0 0 6px rgba(0,212,255,0.8)) brightness(1.1)" }}
            />
          </div>
          <div>
            <div className="auth-brand-name">SOC COMMAND</div>
            <div className="auth-brand-sub">Security Operations Center</div>
          </div>
        </div>

        {/* Hero headline */}
        <div className="auth-hero">
          <div className="auth-hero-tag">
            <span className="auth-live-dot" />
            LIVE MONITORING ACTIVE
          </div>
          <h1 className="auth-hero-title">
            Defend. <span className="auth-hero-accent">Detect.</span><br />
            Respond.
          </h1>
          <p className="auth-hero-desc">
            Your real-time cybersecurity command center. Monitor threats,
            manage incidents and protect your infrastructure — all in one place.
          </p>
        </div>

        {/* Threat stats */}
        <div className="auth-stat-grid">
          {[
            { label: "Threats Blocked", value: 14382, color: "#ff3366" },
            { label: "Events / Hour", value: 2847, color: "#00d4ff" },
            { label: "Uptime", value: 99, color: "#00ff88", suffix: ".8%" },
            { label: "Active Rules", value: 247, color: "#a855f7" },
          ].map(s => (
            <div className="auth-stat-card" key={s.label}>
              <div className="auth-stat-value" style={{ color: s.color }}>
                <AnimatedCounter target={s.value} suffix={s.suffix || ""} />
              </div>
              <div className="auth-stat-label">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Live threat feed */}
        <div className="auth-feed">
          <div className="auth-feed-header">
            <span className="auth-live-dot" style={{ background: "#ff3366" }} />
            LIVE THREAT FEED
            <span className="auth-feed-clock">{timeStr}</span>
          </div>
          <div className="auth-feed-list">
            {visibleEvents.map((ev, i) => {
              const s = SEV_STYLE[ev.sev] || SEV_STYLE.LOW;
              return (
                <div
                  key={i}
                  className="auth-feed-item"
                  style={{ opacity: 1 - i * 0.16, transform: `translateY(${i * 0}px)` }}
                >
                  <span className="auth-feed-sev" style={{ color: s.color, background: s.bg, border: `1px solid ${s.border}` }}>
                    {ev.sev}
                  </span>
                  <span className="auth-feed-ip">{ev.ip}</span>
                  <span className="auth-feed-msg">{ev.msg}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── RIGHT PANEL — Form ──────────────────────────────── */}
      <div className="auth-right">
        <div className="auth-form-wrap">

          {/* Top accent */}
          <div className="auth-form-accent-bar" />

          {/* Header */}
          <div className="auth-form-header">
            <div className="auth-form-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#00d4ff" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                <polyline points="9 12 11 14 15 10" stroke="#00ff88" strokeWidth="2.5" />
              </svg>
            </div>
            <h2 className="auth-form-title">
              {isRegister ? "Create Account" : "Secure Access"}
            </h2>
            <p className="auth-form-subtext">
              {isRegister
                ? "Register a new analyst account"
                : "Authenticate to enter the command center"}
            </p>
          </div>

          {/* Encrypted badge */}
          <div className="auth-enc-badge">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            TLS 1.3 Encrypted · Zero-Knowledge Auth
          </div>

          {/* Form */}
          <form onSubmit={isRegister ? handleRegister : handleLogin} className="auth-form">
            {isRegister && (
              <div className="auth-field-wrap">
                <label className="auth-label">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                  Full Name
                </label>
                <input
                  type="text"
                  className="auth-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                  autoComplete="name"
                />
              </div>
            )}

            <div className="auth-field-wrap">
              <label className="auth-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                Email Address
              </label>
              <input
                type="email"
                className="auth-input"
                placeholder="analyst@soc.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="auth-field-wrap">
              <label className="auth-label">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0110 0v4" />
                </svg>
                Password
              </label>
              <div className="auth-input-wrap">
                <input
                  type={showPass ? "text" : "password"}
                  className="auth-input"
                  placeholder="••••••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  autoComplete={isRegister ? "new-password" : "current-password"}
                  style={{ paddingRight: "2.75rem" }}
                />
                <button
                  type="button"
                  className="auth-eye-btn"
                  onClick={() => setShowPass(p => !p)}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPass ? (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17.94 17.94A10.07 10.07 0 0112 20c-7 0-11-8-11-8a18.45 18.45 0 015.06-5.94M9.9 4.24A9.12 9.12 0 0112 4c7 0 11 8 11 8a18.5 18.5 0 01-2.16 3.19m-6.72-1.07a3 3 0 11-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {error && (
              <div className="auth-error">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </div>
            )}

            <button type="submit" className="auth-submit-btn" disabled={loading}>
              {loading ? (
                <>
                  <span className="auth-spinner" />
                  {isRegister ? "Creating Account…" : "Authenticating…"}
                </>
              ) : (
                <>
                  {isRegister ? (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M16 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
                      <circle cx="8.5" cy="7" r="4" />
                      <line x1="20" y1="8" x2="20" y2="14" />
                      <line x1="23" y1="11" x2="17" y2="11" />
                    </svg>
                  ) : (
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4" />
                      <polyline points="10 17 15 12 10 7" />
                      <line x1="15" y1="12" x2="3" y2="12" />
                    </svg>
                  )}
                  {isRegister ? "Create Analyst Account" : "Access Command Center"}
                </>
              )}
            </button>
          </form>

          {/* Toggle register/login */}
          <p className="auth-toggle-text">
            {isRegister ? "Already have access?" : "Need analyst account?"}
            {" "}
            <button
              className="auth-toggle-btn"
              onClick={() => { setIsRegister(r => !r); setError(""); }}
            >
              {isRegister ? "Sign In" : "Register"}
            </button>
          </p>

          {/* Demo credentials */}
          {!isRegister && (
            <div className="auth-demo-box">
              <div className="auth-demo-label">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
                DEMO CREDENTIALS
              </div>
              <div className="auth-demo-rows">
                <div className="auth-demo-row">
                  <span className="auth-demo-role admin">ADMIN</span>
                  <code>admin@soc.com</code>
                  <span className="auth-demo-sep">·</span>
                  <code>admin123</code>
                </div>
                <div className="auth-demo-row">
                  <span className="auth-demo-role analyst">ANALYST</span>
                  <code>analyst@soc.com</code>
                  <span className="auth-demo-sep">·</span>
                  <code>analyst123</code>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
