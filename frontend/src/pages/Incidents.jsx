import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { getUserRole } from "../utils/roleCheck";

const STATUSES = ["OPEN", "INVESTIGATING", "RESOLVED"];

const getSeverityClass = (severity) => {
  if (severity === "HIGH")   return "badge badge-high";
  if (severity === "MEDIUM") return "badge badge-medium";
  return "badge badge-low";
};

const getStatusClass = (status) => {
  if (status === "RESOLVED")     return "badge badge-resolved";
  if (status === "INVESTIGATING") return "badge badge-investigating";
  return "badge badge-open";
};

export default function Incidents() {
  const [incidents, setIncidents]   = useState([]);
  const [loading, setLoading]       = useState(true);
  const [actionMsg, setActionMsg]   = useState(null);
  const [actionLoading, setActionLoading] = useState(null);
  const [expandedId, setExpandedId] = useState(null);

  // Status update state per incident
  const [statusNote, setStatusNote] = useState({});

  const role    = getUserRole();
  const isAdmin = role === "ADMIN";

  useEffect(() => { fetchIncidents(); }, []);

  const fetchIncidents = async () => {
    try {
      setLoading(true);
      const res = await api.get("/incidents");
      setIncidents(res.data);
    } catch (err) {
      console.error("Error fetching incidents:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (incidentId, newStatus) => {
    setActionLoading(incidentId);
    const note = statusNote[incidentId] || `Status changed to ${newStatus}`;
    try {
      await api.put(`/incidents/${incidentId}/status`, { status: newStatus, note });
      setIncidents(prev =>
        prev.map(i =>
          i._id === incidentId
            ? {
                ...i,
                status: newStatus,
                timeline: [
                  ...(i.timeline || []),
                  { note, addedBy: role, addedAt: new Date().toISOString() },
                ],
              }
            : i
        )
      );
      setStatusNote(prev => ({ ...prev, [incidentId]: "" }));
      flash("success", "Incident updated");
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

  const toggleTimeline = (id) =>
    setExpandedId(prev => (prev === id ? null : id));

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="page">
          <div className="state-block">
            <div className="spinner"></div>
            <p>Loading incidents…</p>
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
          <h2 className="section-title">Security Incidents</h2>
          <button className="btn-primary" onClick={fetchIncidents}>
            🔄 Refresh
          </button>
        </div>

        {actionMsg && (
          <div className={`alert ${actionMsg.type === "success" ? "alert-success" : "alert-error"}`}>
            {actionMsg.type === "success" ? "✅" : "❌"} {actionMsg.text}
          </div>
        )}

        {incidents.length === 0 ? (
          <div className="state-block">
            ✓ No incidents found. Create one from the Alerts page.
          </div>
        ) : (
          <div className="list-stack">
            {incidents.map(i => (
              <div key={i._id} className="incident-card">
                {/* Header row */}
                <div className="incident-header">
                  <h3>{i.title}</h3>
                  <div className="incident-badges">
                    <span className={getSeverityClass(i.severity)}>{i.severity}</span>
                    <span className={getStatusClass(i.status)}>{i.status}</span>
                  </div>
                </div>

                {/* Assignee */}
                {i.assignedTo && (
                  <div className="incident-assignee">
                    <span className="assignee-icon">👤</span>
                    <span>{i.assignedTo.name}</span>
                    <span className="assignee-role">({i.assignedTo.role})</span>
                  </div>
                )}

                {/* Status update (admin + analyst) */}
                {i.status !== "RESOLVED" && (
                  <div className="incident-update">
                    <input
                      type="text"
                      className="search-input"
                      placeholder="Add a note (optional)…"
                      value={statusNote[i._id] || ""}
                      onChange={e =>
                        setStatusNote(prev => ({ ...prev, [i._id]: e.target.value }))
                      }
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
                  <button
                    className="timeline-toggle"
                    onClick={() => toggleTimeline(i._id)}
                  >
                    {expandedId === i._id ? "▲" : "▼"} Timeline ({i.timeline.length})
                  </button>
                )}

                {/* Timeline entries */}
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
  );
}
