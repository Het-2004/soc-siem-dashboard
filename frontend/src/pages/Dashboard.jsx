import { useEffect, useState, useRef } from "react";
import { io } from "socket.io-client";
import api from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import ThreatMap from "../components/ThreatMap";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const SEVERITY_COLORS = {
  HIGH: "#ff3366",
  MEDIUM: "#ff9f43",
  LOW: "#00ff88",
};

/* ── Animated counter hook ─────────────────────────────────── */
function useCountUp(target, duration = 1000) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!target) return;
    let start = 0;
    const step = target / (duration / 16);
    const timer = setInterval(() => {
      start += step;
      if (start >= target) { setVal(target); clearInterval(timer); }
      else { setVal(Math.floor(start)); }
    }, 16);
    return () => clearInterval(timer);
  }, [target, duration]);
  return val;
}

/* ── Recharts custom tooltip ───────────────────────────────── */
const DarkTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="custom-tooltip" style={{
      background: "rgba(3, 8, 16, 0.85)",
      border: "1px solid rgba(0, 212, 255, 0.2)",
      borderRadius: "8px",
      padding: "1rem",
      backdropFilter: "blur(12px)",
      boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
    }}>
      <div style={{
        color: "var(--neon-cyan)",
        marginBottom: "8px",
        fontWeight: 700,
        fontFamily: "var(--font-mono)",
        fontSize: "0.85rem",
        letterSpacing: "0.05em",
        borderBottom: "1px solid rgba(255,255,255,0.1)",
        paddingBottom: "4px"
      }}>
        {label ? (label.startsWith('Day') ? label : `Day ${label}`) : "Details"}
      </div>
      {payload.map((p, i) => (
        <div key={i} style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "1.5rem",
          margin: "4px 0",
          fontFamily: "var(--font-mono)",
          fontSize: "0.8rem",
          color: "#e2e8f0"
        }}>
          <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: p.color, boxShadow: `0 0 8px ${p.color}` }}></span>
            {p.name.toUpperCase()}
          </span>
          <strong style={{ color: p.color, fontSize: "0.95rem" }}>{p.value}</strong>
        </div>
      ))}
    </div>
  );
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([]);

  const totalCount = useCountUp(stats?.total || 0);
  const highCount = useCountUp(stats?.high || 0);
  const mediumCount = useCountUp(stats?.medium || 0);
  const lowCount = useCountUp(stats?.low || 0);

  /* ── Socket.IO real-time ───────────────────────────────── */
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });
    socket.on("new-alert", (alert) => {
      const id = Date.now() + Math.random();
      setLiveAlerts(prev => [{ ...alert, id }, ...prev].slice(0, 4));
      // Also update stats live
      setStats(prev => {
        if (!prev) return prev;
        const sevKey = (alert.severity || "low").toLowerCase();
        return {
          ...prev,
          total: (prev.total || 0) + 1,
          [sevKey]: (prev[sevKey] || 0) + 1
        };
      });
      setTimeout(() => setLiveAlerts(prev => prev.filter(n => n.id !== id)), 8000);
    });
    return () => socket.disconnect();
  }, []);

  /* ── Initial data fetch ────────────────────────────────── */
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [statsRes, trendsRes, alertsRes] = await Promise.allSettled([
        api.get("/stats"),
        api.get("/trends"),
        api.get("/alerts"),
      ]);
      if (statsRes.status === "fulfilled") setStats(statsRes.value.data);
      if (trendsRes.status === "fulfilled") setTrends(trendsRes.value.data);
      if (alertsRes.status === "fulfilled") setAlerts(alertsRes.value.data);
    } catch {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (id) => setLiveAlerts(prev => prev.filter(n => n.id !== id));

  const pieData = stats
    ? [
      { name: "HIGH", value: stats.high || 0, fill: SEVERITY_COLORS.HIGH },
      { name: "MEDIUM", value: stats.medium || 0, fill: SEVERITY_COLORS.MEDIUM },
      { name: "LOW", value: stats.low || 0, fill: SEVERITY_COLORS.LOW },
    ].filter(d => d.value > 0)
    : [];

  /* ── Loading ───────────────────────────────────────────── */
  if (loading) return (
    <div className="app-shell">
      <Navbar />
      <div className="main-content">
        <div className="page">
          <div className="state-block" style={{ paddingTop: "6rem" }}>
            <div className="spinner" />
            <p style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Connecting to SOC systems…
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      {/* Live alert toasts */}
      {liveAlerts.length > 0 && (
        <div className="live-alerts-wrapper">
          {liveAlerts.map(alert => (
            <div key={alert.id} className="live-alert-item">
              <span className="live-alert-icon">🚨</span>
              <div className="live-alert-body">
                <div className="live-alert-title">New Threat Detected</div>
                <div className="live-alert-text">{alert.title}</div>
                <div className="live-alert-meta">
                  <span className="live-alert-severity" style={{ color: SEVERITY_COLORS[alert.severity] || "#fff" }}>
                    ● {alert.severity}
                  </span>
                  <span>{alert.ip}</span>
                </div>
              </div>
              <button className="live-alert-close" onClick={() => dismissAlert(alert.id)} title="Dismiss">✕</button>
            </div>
          ))}
        </div>
      )}

      <Navbar />

      <div className="main-content">
        <div className="page">
          {/* Header */}
          <div className="page-header">
            <h2 className="section-title">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--neon-cyan)" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" /><rect x="14" y="14" width="7" height="7" />
              </svg>
              Security Operations
            </h2>
            <button className="btn-primary" onClick={fetchData} disabled={loading}>
              ⟳ Refresh
            </button>
          </div>

          {/* Security Status Bar */}
          <div className="security-status-bar">
            <div className="security-status-item active">
              <span className="dot" /> Systems Online
            </div>
            <div className="security-status-item">
              🔒 JWT Auth Active
            </div>
            <div className="security-status-item">
              🛡️ Rate Limiting Enabled
            </div>
            <div className="security-status-item">
              🚫 IP Blocking Active
            </div>
            <div className="security-status-item">
              📋 Audit Logging ON
            </div>
          </div>

          {error && <div className="alert alert-error">⚠ {error}</div>}

          {/* KPI Cards */}
          {stats && (
            <div className="kpi-grid">
              <div className="kpi-card">
                <div className="kpi-icon">📊</div>
                <div className="kpi-label">Total Alerts</div>
                <div className="kpi-value" style={{ color: "var(--neon-cyan)" }}>{totalCount}</div>
              </div>
              <div className="kpi-card" style={{ borderColor: "rgba(255,51,102,0.2)" }}>
                <div className="kpi-icon">🔴</div>
                <div className="kpi-label">Critical / High</div>
                <div className="kpi-value" style={{ color: SEVERITY_COLORS.HIGH }}>{highCount}</div>
              </div>
              <div className="kpi-card" style={{ borderColor: "rgba(255,159,67,0.2)" }}>
                <div className="kpi-icon">🟡</div>
                <div className="kpi-label">Medium Risk</div>
                <div className="kpi-value" style={{ color: SEVERITY_COLORS.MEDIUM }}>{mediumCount}</div>
              </div>
              <div className="kpi-card" style={{ borderColor: "rgba(0,255,136,0.15)" }}>
                <div className="kpi-icon">🟢</div>
                <div className="kpi-label">Low Severity</div>
                <div className="kpi-value" style={{ color: SEVERITY_COLORS.LOW }}>{lowCount}</div>
              </div>
            </div>
          )}

          {/* Threat Map */}
          <ThreatMap alerts={alerts} stats={stats} />

          {/* Charts */}
          <div className="chart-grid">
            {pieData?.length > 0 && (
              <div className="card">
                <div className="card-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                  Alert Severity Distribution
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                    <Pie
                      data={pieData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={105}
                      innerRadius={55}
                      paddingAngle={4}
                      stroke="none"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      labelLine={{ stroke: "rgba(0, 212, 255, 0.4)", strokeWidth: 1, length1: 15, length2: 10 }}
                    >
                      {pieData?.map((entry, i) => (
                        <Cell
                          key={`cell-${i}`}
                          fill={entry.fill}
                          style={{
                            filter: `drop-shadow(0 0 12px ${entry.fill}60)`,
                            cursor: 'pointer'
                          }}
                        />
                      ))}
                    </Pie>
                    <Tooltip content={<DarkTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                    <Legend
                      verticalAlign="bottom"
                      height={36}
                      iconType="circle"
                      formatter={(val) => (
                        <span style={{ color: "#94a3b8", fontSize: "0.85rem", fontFamily: "var(--font-mono)", marginLeft: "4px" }}>{val}</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {trends?.length > 0 && (
              <div className="card">
                <div className="card-title">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                  7-Day Alert Trend
                </div>
                <ResponsiveContainer width="100%" height={280}>
                  <AreaChart data={trends} margin={{ top: 25, right: 30, left: 0, bottom: 5 }}>
                    <defs>
                      <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#00d4ff" stopOpacity={0.45} />
                        <stop offset="60%" stopColor="#a855f7" stopOpacity={0.15} />
                        <stop offset="100%" stopColor="#00d4ff" stopOpacity={0.0} />
                      </linearGradient>
                      <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="3" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                      </filter>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="4 4"
                      stroke="rgba(0, 212, 255, 0.08)"
                      vertical={false}
                    />
                    <XAxis
                      dataKey="_id"
                      stroke="rgba(100, 116, 139, 0.5)"
                      tick={{ fill: "#64748b", fontSize: 11, fontFamily: "var(--font-mono)" }}
                      tickFormatter={v => `Day ${v}`}
                      tickMargin={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      stroke="rgba(100, 116, 139, 0.5)"
                      tick={{ fill: "#64748b", fontSize: 11, fontFamily: "var(--font-mono)" }}
                      allowDecimals={false}
                      tickMargin={12}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<DarkTooltip />} cursor={{ stroke: 'rgba(0,212,255,0.3)', strokeWidth: 1.5, strokeDasharray: '4 4' }} />
                    <Area
                      type="monotone"
                      dataKey="count"
                      name="Alert Volume"
                      stroke="#00d4ff"
                      strokeWidth={3}
                      fill="url(#areaGrad)"
                      activeDot={{ r: 6, fill: "#fff", stroke: "#00d4ff", strokeWidth: 3, filter: "url(#glow)" }}
                      dot={{ r: 0 }}
                      animationDuration={1500}
                      animationEasing="ease-out"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {(!pieData || pieData.length === 0) && (!trends || trends.length === 0) && (
              <div className="state-block" style={{ gridColumn: "1/-1" }}>
                <div style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
                  📊 No chart data available. Run the seed script or add alerts.
                </div>
              </div>
            )}
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
