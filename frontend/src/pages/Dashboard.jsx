import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
} from "recharts";

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:5000";

const SEVERITY_COLORS = {
  HIGH:   "#e74c3c",
  MEDIUM: "#f39c12",
  LOW:    "#27ae60",
};

export default function Dashboard() {
  const [stats, setStats]         = useState(null);
  const [trends, setTrends]       = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState(null);
  const [liveAlerts, setLiveAlerts] = useState([]);

  /* ── Real-time socket ──────────────────────────────────────── */
  useEffect(() => {
    const socket = io(SOCKET_URL, { transports: ["websocket", "polling"] });

    socket.on("new-alert", (alert) => {
      const id = Date.now() + Math.random();
      setLiveAlerts(prev => [{ ...alert, id }, ...prev].slice(0, 4));
      // Auto-dismiss after 8 s
      setTimeout(() => {
        setLiveAlerts(prev => prev.filter(n => n.id !== id));
      }, 8000);
    });

    return () => socket.disconnect();
  }, []);

  /* ── Data fetch ────────────────────────────────────────────── */
  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [statsRes, trendsRes] = await Promise.allSettled([
        api.get("/stats"),
        api.get("/trends"),
      ]);

      if (statsRes.status  === "fulfilled") setStats(statsRes.value.data);
      if (trendsRes.status === "fulfilled") setTrends(trendsRes.value.data);
    } catch (err) {
      setError("Failed to load dashboard data");
    } finally {
      setLoading(false);
    }
  };

  const dismissAlert = (id) =>
    setLiveAlerts(prev => prev.filter(n => n.id !== id));

  /* ── Derived chart data ─────────────────────────────────────── */
  const pieData = stats
    ? [
        { name: "HIGH",   value: stats.high   || 0, fill: SEVERITY_COLORS.HIGH   },
        { name: "MEDIUM", value: stats.medium || 0, fill: SEVERITY_COLORS.MEDIUM },
        { name: "LOW",    value: stats.low    || 0, fill: SEVERITY_COLORS.LOW    },
      ].filter(d => d.value > 0)
    : [];

  /* ── Loading state ─────────────────────────────────────────── */
  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="page">
          <div className="state-block">
            <div className="spinner"></div>
            <p>Loading dashboard…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* ── Live alert toasts ─────────────────────────────────── */}
      {liveAlerts.length > 0 && (
        <div className="live-alerts-wrapper">
          {liveAlerts.map(alert => (
            <div key={alert.id} className="live-alert-item">
              <span className="live-alert-icon">🚨</span>
              <div className="live-alert-body">
                <div className="live-alert-title">New Alert Detected</div>
                <div className="live-alert-text">{alert.title}</div>
                <div className="live-alert-meta">
                  <span
                    className="live-alert-severity"
                    style={{ color: SEVERITY_COLORS[alert.severity] || "#fff" }}
                  >
                    ● {alert.severity}
                  </span>
                  <span>{alert.ip}</span>
                </div>
              </div>
              <button
                className="live-alert-close"
                onClick={() => dismissAlert(alert.id)}
                title="Dismiss"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      <Navbar />

      <div className="page">
        <div className="page-header">
          <h2 className="section-title">SOC Dashboard Analytics</h2>
          <button className="btn-primary" onClick={fetchData} disabled={loading}>
            🔄 Refresh
          </button>
        </div>

        {error && <div className="alert alert-error">{error}</div>}

        {/* ── KPI cards ────────────────────────────────────────── */}
        {stats && (
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon">📊</div>
              <div className="kpi-label">Total Alerts</div>
              <div className="kpi-value" style={{ color: "#667eea" }}>{stats.total || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">🔴</div>
              <div className="kpi-label">High Severity</div>
              <div className="kpi-value" style={{ color: SEVERITY_COLORS.HIGH }}>{stats.high || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">🟡</div>
              <div className="kpi-label">Medium Severity</div>
              <div className="kpi-value" style={{ color: SEVERITY_COLORS.MEDIUM }}>{stats.medium || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">🟢</div>
              <div className="kpi-label">Low Severity</div>
              <div className="kpi-value" style={{ color: SEVERITY_COLORS.LOW }}>{stats.low || 0}</div>
            </div>
          </div>
        )}

        {/* ── Charts ───────────────────────────────────────────── */}
        <div className="chart-grid">
          {pieData.length > 0 && (
            <div className="card">
              <div className="card-title">Alert Severity Distribution</div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={pieData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={100}
                    label={({ name, percent }) =>
                      `${name} ${(percent * 100).toFixed(0)}%`
                    }
                  >
                    {pieData.map((entry, i) => (
                      <Cell key={i} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {trends.length > 0 && (
            <div className="card">
              <div className="card-title">7-Day Alert Trend</div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--card-border)" />
                  <XAxis
                    dataKey="_id"
                    stroke="var(--text-muted)"
                    tickFormatter={v => `Day ${v}`}
                  />
                  <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{
                      background: "var(--card-bg)",
                      border: "1px solid var(--card-border)",
                      borderRadius: "8px",
                    }}
                    labelFormatter={v => `Day ${v}`}
                  />
                  <Line
                    type="monotone"
                    dataKey="count"
                    stroke="#667eea"
                    strokeWidth={3}
                    dot={{ fill: "#667eea", r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {pieData.length === 0 && trends.length === 0 && (
            <div className="state-block" style={{ gridColumn: "1/-1" }}>
              📊 No chart data available yet. Run the seed script or add some alerts.
            </div>
          )}
        </div>
      </div>

      <Footer />
    </div>
  );
}
