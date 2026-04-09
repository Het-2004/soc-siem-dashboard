import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getUserRole } from "../utils/roleCheck";

const STATUSES = ["OPEN", "INVESTIGATING", "RESOLVED"];

const getSeverityClass = (s) => s === "HIGH" ? "badge badge-high" : s === "MEDIUM" ? "badge badge-medium" : "badge badge-low";
const getStatusClass = (s) => s === "RESOLVED" ? "badge badge-resolved" : s === "INVESTIGATING" ? "badge badge-investigating" : "badge badge-open";

const borderColor = (sev) => sev === "HIGH" ? "var(--severity-high)" : sev === "MEDIUM" ? "var(--severity-medium)" : "var(--severity-low)";

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [statusNote, setStatusNote] = useState({});

  const role = getUserRole();
  const isAdmin = role === "ADMIN";

  useEffect(() => { fetchIncidents(); }, []);

  useEffect(() => {
    const socket = io(import.meta.env.VITE_SOCKET_URL || "http://localhost:5000", { transports: ["websocket", "polling"] });
    socket.on("incident-updated", (updatedIncident) => {
      setIncidents((prev) => 
        prev?.map(i => i._id === updatedIncident._id ? { ...i, ...updatedIncident } : i) || []
      );
    });
    return () => socket.disconnect();
  }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/incidents");
      setIncidents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (incidentId, newStatus) => {
    setActionLoading(incidentId);
    const note = statusNote[incidentId] || `Status changed to ${newStatus}`;
    try {
      await api.put(`/incidents/${incidentId}/status`, { status: newStatus, note });
      setIncidents(prev => prev.map(i =>
        i._id === incidentId
          ? { ...i, status: newStatus, timeline: [...(i.timeline || []), { note, addedBy: role, addedAt: new Date().toISOString() }] }
          : i
      ));
      setStatusNote(prev => ({ ...prev, [incidentId]: "" }));
      flash("success", "Incident status updated");
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to update incident");
    } finally {
      setActionLoading(null);
    }
  };

  const flash = (type, text) => {
    setActionMsg({ type, text });
    setTimeout(() => setActionMsg(null), 4000);
  };

  const toggleTimeline = (id) => setExpandedId(prev => prev === id ? null : id);

  if (loading) return (
    <div className="app-shell">
      <Navbar />
      <div className="main-content">
        <div className="page">
          <div className="state-block" style={{ paddingTop: "6rem" }}>
            <div className="spinner" />
            <p style={{ fontFamily: "var(--font-mono)", color: "var(--text-muted)", fontSize: "0.9rem" }}>
              Loading incidents…
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
          <div className="page-header">
            <h2 className="section-title">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--severity-medium)" strokeWidth="2">
                <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
              Security Incidents
            </h2>
            <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.82rem", color: "var(--text-muted)" }}>
                {(incidents || []).filter(i => i.status !== "RESOLVED").length} active / {(incidents || []).length} total
              </span>
              <button className="btn-primary" onClick={fetchIncidents}>⟳ Refresh</button>
            </div>
          </div>

          {actionMsg && (
            <div className={`alert ${actionMsg.type === "success" ? "alert-success" : "alert-error"}`}>
              {actionMsg.type === "success" ? "✅" : "⚠"} {actionMsg.text}
            </div>
          )}

          {(incidents || []).length === 0 ? (
            <div className="state-block">
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.9rem" }}>
                No incidents found. Create one from the Alerts page.
              </div>
            </div>
          ) : (
            <div className="list-stack">
              {incidents?.map(i => (
                <div
                  key={i._id}
                  className="incident-card"
                  style={{ borderLeftColor: borderColor(i.severity) }}
                >
                  {/* Header */}
                  <div className="incident-header">
                    <div>
                      <h3 style={{ color: "var(--text-bright)", fontWeight: 700, fontSize: "1rem" }}>{i.title}</h3>
                      {i.createdAt && (
                        <div style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)", marginTop: "0.2rem" }}>
                          Created {new Date(i.createdAt).toLocaleString()}
                        </div>
                      )}
                    </div>
                    <div className="incident-badges">
                      <span className={getSeverityClass(i.severity)}>{i.severity}</span>
                      <span className={getStatusClass(i.status)}>{i.status}</span>
                    </div>
                  </div>

                  {/* Assignee */}
                  {i.assignedTo && (
                    <div className="incident-assignee">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                        <circle cx="12" cy="7" r="4" />
                      </svg>
                      <span style={{ color: "var(--text-primary)" }}>{i.assignedTo.name || "Assigned"}</span>
                      <span className="assignee-role">({i.assignedTo.role || i.assignedTo})</span>
                    </div>
                  )}

                  {/* Status update (non-resolved) */}
                  {i.status !== "RESOLVED" && (
                    <div className="incident-update">
                      <input
                        type="text"
                        className="search-input"
                        placeholder="Add investigation note (optional)…"
                        value={statusNote[i._id] || ""}
                        onChange={e => setStatusNote(prev => ({ ...prev, [i._id]: e.target.value }))}
                        style={{ flex: 1, minWidth: 0 }}
                      />
                      {STATUSES.filter(s => s !== i.status).map(s => (
                        <button
                          key={s}
                          className={`btn-status ${s.toLowerCase()}`}
                          disabled={actionLoading === i._id}
                          onClick={() => handleStatusUpdate(i._id, s)}
                        >
                          {actionLoading === i._id ? "…" : `→ ${s}`}
                        </button>
                      ))}
                    </div>
                  )}

                  {/* Timeline toggle */}
                  {i.timeline && i.timeline.length > 0 && (
                    <button className="timeline-toggle" onClick={() => toggleTimeline(i._id)}>
                      {expandedId === i._id ? "▲" : "▼"} Timeline ({i.timeline.length} entries)
                    </button>
                  )}

                  {/* Timeline */}
                  {expandedId === i._id && i.timeline && (
                    <div className="timeline">
                      {i.timeline.map((t, idx) => (
                        <div key={idx} className="timeline-entry">
                          <div className="timeline-dot" />
                          <div className="timeline-content">
                            <span className="timeline-role">{t.addedBy}</span>
                            <span className="timeline-note">{t.note}</span>
                            {t.addedAt && (
                              <span className="timeline-time">
                                {new Date(t.addedAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <Footer />
      </div>
    </div>
  );
}
