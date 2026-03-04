import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getUserRole } from "../utils/roleCheck";

const STATUSES   = ["OPEN", "ACKNOWLEDGED", "RESOLVED"];

const getSeverityClass = (severity) => {
  if (severity === "HIGH")   return "badge badge-high";
  if (severity === "MEDIUM") return "badge badge-medium";
  return "badge badge-low";
};

const getStatusClass = (status) => {
  if (status === "RESOLVED")     return "badge badge-resolved";
  if (status === "ACKNOWLEDGED") return "badge badge-investigating";
  return "badge badge-open";
};

export default function Alerts() {
  const [alerts, setAlerts]             = useState([]);
  const [loading, setLoading]           = useState(true);
  const [searchTerm, setSearchTerm]     = useState("");
  const [severityFilter, setSeverityFilter] = useState("ALL");
  const [actionMsg, setActionMsg]       = useState(null);  // { type: "success"|"error", text }
  const [actionLoading, setActionLoading] = useState(null); // alert id being acted upon

  const role = getUserRole();
  const isAdmin = role === "ADMIN";

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = () => {
    setLoading(true);
    api.get("/alerts")
      .then(res => { setAlerts(res.data); setLoading(false); })
      .catch(err => { console.error("Error fetching alerts:", err); setLoading(false); });
  };

  /* ── Update alert status ───────────────────────────────── */
  const handleStatusChange = async (alertId, newStatus) => {
    setActionLoading(alertId);
    try {
      await api.put(`/alerts/${alertId}`, { status: newStatus });
      setAlerts(prev =>
        prev.map(a => a._id === alertId ? { ...a, status: newStatus } : a)
      );
      flash("success", `Status updated to ${newStatus}`);
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to update status");
    } finally {
      setActionLoading(null);
    }
  };

  /* ── Create incident from alert ─────────────────────────── */
  const handleCreateIncident = async (alertId) => {
    setActionLoading(alertId);
    try {
      await api.post("/incidents", { alertId });
      flash("success", "Incident created successfully");
      // Mark alert as ACKNOWLEDGED locally
      setAlerts(prev =>
        prev.map(a => a._id === alertId ? { ...a, status: "ACKNOWLEDGED" } : a)
      );
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

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="page">
          <div className="state-block">
            <div className="spinner"></div>
            <p>Loading alerts…</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h2 className="section-title">Security Alerts</h2>
          <input
            type="text"
            className="search-input"
            placeholder="🔍 Search by title or IP…"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Feedback banner */}
        {actionMsg && (
          <div className={`alert ${actionMsg.type === "success" ? "alert-success" : "alert-error"}`}>
            {actionMsg.type === "success" ? "✅" : "❌"} {actionMsg.text}
          </div>
        )}

        {/* Severity filters */}
        <div className="filters">
          {[
            { label: "All Alerts", value: "ALL" },
            { label: "🔴 High",    value: "HIGH",   cls: "filter-high"   },
            { label: "🟡 Medium",  value: "MEDIUM", cls: "filter-medium" },
            { label: "🟢 Low",     value: "LOW",    cls: "filter-low"    },
          ].map(f => (
            <button
              key={f.value}
              className={`filter-btn ${f.cls || ""} ${severityFilter === f.value ? "active" : ""}`}
              onClick={() => setSeverityFilter(f.value)}
            >
              {f.label}
            </button>
          ))}
        </div>

        {!filteredAlerts.length ? (
          <div className="state-block">No alerts match your filter.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Severity</th>
                  <th>IP Address</th>
                  <th>Status</th>
                  <th>Created At</th>
                  {isAdmin && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {filteredAlerts.map(a => (
                  <tr key={a._id}>
                    <td>{a.title}</td>
                    <td>
                      <span className={getSeverityClass(a.severity)}>{a.severity}</span>
                    </td>
                    <td style={{ fontFamily: "monospace" }}>{a.ipAddress}</td>
                    <td>
                      <span className={getStatusClass(a.status)}>{a.status}</span>
                    </td>
                    <td>{new Date(a.createdAt).toLocaleString()}</td>

                    {isAdmin && (
                      <td>
                        <div className="action-row">
                          {/* Status update */}
                          <select
                            className="select-input select-sm"
                            value={a.status}
                            disabled={actionLoading === a._id}
                            onChange={e => handleStatusChange(a._id, e.target.value)}
                          >
                            {STATUSES.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>

                          {/* Create incident (only for non-resolved alerts) */}
                          {a.status !== "RESOLVED" && (
                            <button
                              className="btn-action"
                              disabled={actionLoading === a._id}
                              onClick={() => handleCreateIncident(a._id)}
                              title="Create Incident"
                            >
                              {actionLoading === a._id ? "…" : "🔴 Incident"}
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
  );
}
