import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getUserRole } from "../utils/roleCheck";

const STATUSES = ["OPEN", "ACKNOWLEDGED", "RESOLVED"];

const severityColor = (s) => s === "HIGH" ? "var(--severity-high)" : s === "MEDIUM" ? "var(--severity-medium)" : "var(--severity-low)";

const getSeverityClass = (s) => s === "HIGH" ? "badge badge-high" : s === "MEDIUM" ? "badge badge-medium" : "badge badge-low";
const getStatusClass = (s) => s === "RESOLVED" ? "badge badge-resolved" : s === "ACKNOWLEDGED" ? "badge badge-investigating" : "badge badge-open";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [actionMsg, setActionMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);

  const role = getUserRole();
  const isAdmin = role === "ADMIN";

  useEffect(() => { fetchAlerts(); }, []);

  const fetchAlerts = () => {
    setLoading(true);
    api.get("/alerts")
      .then(res => { setAlerts(res.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  const handleStatusChange = async (alertId, newStatus) => {
    setActionLoading(alertId);
    try {
      await api.put(`/alerts/${alertId}`, { status: newStatus });
      setAlerts(prev => prev.map(a => a._id === alertId ? { ...a, status: newStatus } : a));
      flash("success", `Status → ${newStatus}`);
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCreateIncident = async (alertId) => {
    setActionLoading(alertId);
    try {
      await api.post("/incidents", { alertId });
      flash("success", "Incident created successfully");
      setAlerts(prev => prev.map(a => a._id === alertId ? { ...a, status: "ACKNOWLEDGED" } : a));
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to create incident");
    } finally {
      setActionLoading(null);
    }
  };

  const flash = (type, text) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  };

  const filteredAlerts = alerts.filter(alert => {
    const matchesSearch =
      alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      alert.ipAddress.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSeverity = severityFilter === "ALL" || alert.severity === severityFilter;
    return matchesSearch && matchesSeverity;
  });

  if (loading) return (
    <div className="app-shell">
      <Navbar />
      <div className="main-content">
        <div className="page">
          <div className="state-block" style={{ paddingTop: "6rem" }}>
            <div className="spinner" />
            <p style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Loading alerts…
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="app-shell">
      <Navbar />
      <div className="main-content">
        <div className="page">
          {/* Header */}
          <div className="page-header">
            <h2 className="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--severity-high)" strokeWidth="2">
                <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                <line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              Security Alerts
            </h2>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", flexWrap: "wrap" }}>
              <input
                type="text"
                className="search-input"
                placeholder="🔍 Search title or IP…"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
              <button className="btn-primary" onClick={fetchAlerts}>⟳ Refresh</button>
            </div>
          </div>

          {/* Feedback */}
          {actionMsg && (
            <div className={`alert ${actionMsg.type === "success" ? "alert-success" : "alert-error"}`}>
              {actionMsg.type === "success" ? "✅" : "⚠"} {actionMsg.text}
            </div>
          )}

          {/* Filters */}
          <div className="filters">
            {[
              { label: "All Alerts", value: "ALL" },
              { label: "🔴 High", value: "HIGH", cls: "filter-high" },
              { label: "🟡 Medium", value: "MEDIUM", cls: "filter-medium" },
              { label: "🟢 Low", value: "LOW", cls: "filter-low" },
            ].map(f => (
              <button
                key={f.value}
                className={`filter-btn ${f.cls || ""} ${severityFilter === f.value ? "active" : ""}`}
                onClick={() => setSeverityFilter(f.value)}
              >
                {f.label}
                {f.value !== "ALL" && (
                  <span style={{ marginLeft: "0.4rem", fontFamily: "var(--font-mono)", fontSize: "0.78rem", opacity: 0.7 }}>
                    ({alerts.filter(a => a.severity === f.value).length})
                  </span>
                )}
              </button>
            ))}
            <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--text-muted)", marginLeft: "auto", display: "flex", alignItems: "center" }}>
              {filteredAlerts.length} of {alerts.length} alerts
            </span>
          </div>

          {!filteredAlerts.length ? (
            <div className="state-block">
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>No alerts match your filter.</div>
            </div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Severity</th>
                    <th>IP Address</th>
                    <th>Status</th>
                    <th>Detected At</th>
                    {isAdmin && <th>Actions</th>}
                  </tr>
                </thead>
                <tbody>
                  {filteredAlerts.map(a => (
                    <tr key={a._id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                          {a.severity === "HIGH" && (
                            <span style={{
                              width: 8, height: 8, borderRadius: "50%",
                              background: "var(--severity-high)",
                              display: "inline-block",
                              boxShadow: "0 0 6px var(--severity-high)",
                              animation: "threat-pulse 1.5s ease-in-out infinite",
                              flexShrink: 0,
                            }} />
                          )}
                          <span style={{ color: "var(--text-bright)", fontWeight: 500 }}>{a.title}</span>
                        </div>
                      </td>
                      <td>
                        <span className={getSeverityClass(a.severity)}>{a.severity}</span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.88rem", color: "var(--neon-cyan)" }}>
                        {a.ipAddress}
                      </td>
                      <td>
                        <span className={getStatusClass(a.status)}>{a.status}</span>
                      </td>
                      <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                        {new Date(a.createdAt).toLocaleString()}
                      </td>
                      {isAdmin && (
                        <td>
                          <div className="action-row">
                            <select
                              className="select-input select-sm"
                              value={a.status}
                              disabled={actionLoading === a._id}
                              onChange={e => handleStatusChange(a._id, e.target.value)}
                            >
                              {STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
                            </select>
                            {a.status !== "RESOLVED" && (
                              <button
                                className="btn-action"
                                disabled={actionLoading === a._id}
                                onClick={() => handleCreateIncident(a._id)}
                                title="Create Incident"
                              >
                                {actionLoading === a._id ? "…" : "+ Incident"}
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}
