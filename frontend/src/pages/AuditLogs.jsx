import { useEffect, useState } from "react";
import api from "../api/api";
import PageShell from "../components/PageShell";

/* ── HTTP Method metadata ──────────────────────────────────────── */
const METHOD_META = {
  GET: { label: "GET", color: "#00d4ff", bg: "rgba(0,212,255,0.1)", border: "rgba(0,212,255,0.2)", icon: EyeIcon },
  POST: { label: "POST", color: "#00ff88", bg: "rgba(0,255,136,0.1)", border: "rgba(0,255,136,0.2)", icon: PlusIcon },
  PUT: { label: "PUT", color: "#ff9f43", bg: "rgba(255,159,67,0.1)", border: "rgba(255,159,67,0.2)", icon: EditIcon },
  PATCH: { label: "PATCH", color: "#ff9f43", bg: "rgba(255,159,67,0.1)", border: "rgba(255,159,67,0.2)", icon: EditIcon },
  DELETE: { label: "DELETE", color: "#ff3366", bg: "rgba(255,51,102,0.1)", border: "rgba(255,51,102,0.25)", icon: TrashIcon },
};

function EyeIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

function EditIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <path d="M11 4H4a2 2 0 00-2 2v14c0 1.1.9 2 2 2h14a2 2 0 002-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  );
}

function TrashIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
      <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14H6L5 6" /><path d="M10 11v6M14 11v6" />
      <path d="M9 6V4h6v2" />
    </svg>
  );
}

/* Parse  "GET /api/alerts" → { method, path, highlight } */
function parseAction(action = "") {
  const parts = action.trim().split(" ");
  const method = parts[0]?.toUpperCase() || "GET";
  const path = parts.slice(1).join(" ") || action;
  return { method, path };
}

/* Role badge */
function RoleBadge({ role }) {
  const isAdmin = role === "ADMIN";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: "0.25rem",
      padding: "0.2rem 0.55rem",
      borderRadius: 999,
      fontSize: "0.68rem",
      fontWeight: 600,
      fontFamily: "var(--font-mono)",
      textTransform: "uppercase",
      letterSpacing: "0.05em",
      background: isAdmin ? "rgba(168,85,247,0.15)" : "rgba(0,212,255,0.1)",
      color: isAdmin ? "#a855f7" : "#00d4ff",
      border: isAdmin ? "1px solid rgba(168,85,247,0.25)" : "1px solid rgba(0,212,255,0.2)",
    }}>
      {isAdmin ? (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
        </svg>
      ) : (
        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" />
        </svg>
      )}
      {role || "USER"}
    </span>
  );
}

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => { fetchAuditLogs(); }, []);

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get("/audit-logs");
      setLogs(res.data);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const METHODS = ["ALL", "GET", "POST", "PUT", "DELETE"];

  const filtered = filter === "ALL"
    ? logs
    : logs.filter(l => parseAction(l.action).method === filter);

  const counts = METHODS.slice(1).reduce((acc, m) => {
    acc[m] = logs.filter(l => parseAction(l.action).method === m).length;
    return acc;
  }, {});

  if (loading) {
    return (
      <PageShell title="Audit Logs">
        <div className="state-block" style={{ paddingTop: "4rem" }}>
          <div className="spinner" />
          <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
            Loading audit trail…
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Audit Logs"
      subtitle={`${filtered.length} of ${logs.length} entries`}
      actions={
        <button className="btn-primary" onClick={fetchAuditLogs} style={{ fontSize: "0.8rem", padding: "0.35rem 0.85rem" }}>
          ↻ Refresh
        </button>
      }
    >
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0110 0v4" />
            </svg>
            Audit Trail
          </h2>
          <div className="section-subtitle">All authenticated API actions · real-time recorded by the system</div>
        </div>

        {/* Method summary chips */}
        <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
          {Object.entries(counts).map(([method, count]) => {
            const m = METHOD_META[method] || METHOD_META.GET;
            const Icon = m.icon;
            return (
              <span key={method} style={{ display: "inline-flex", alignItems: "center", gap: "0.3rem", padding: "0.2rem 0.6rem", borderRadius: 6, fontSize: "0.7rem", fontFamily: "var(--font-mono)", fontWeight: 700, background: m.bg, color: m.color, border: `1px solid ${m.border}` }}>
                <Icon /> {method}·{count}
              </span>
            );
          })}
        </div>
      </div>

      {/* Method filter pills */}
      <div className="filters" style={{ marginBottom: "1rem" }}>
        {METHODS.map(m => {
          const meta = METHOD_META[m];
          const Icon = meta?.icon;
          const isActive = filter === m;
          return (
            <button
              key={m}
              className={`filter-btn ${isActive ? "active" : ""}`}
              style={isActive && meta ? { borderColor: meta.color, color: meta.color, background: meta.bg } : {}}
              onClick={() => setFilter(m)}
            >
              {Icon && <Icon />} {m === "ALL" ? "All Actions" : m}
            </button>
          );
        })}
      </div>

      {/* Table */}
      {filtered.length === 0 ? (
        <div className="state-block">No audit entries match this filter.</div>
      ) : (
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th style={{ width: 100 }}>Method</th>
                <th>Endpoint</th>
                <th style={{ width: 110 }}>Role</th>
                <th style={{ width: 140 }}>IP Address</th>
                <th style={{ width: 180 }}>Timestamp</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(log => {
                const { method, path } = parseAction(log.action);
                const m = METHOD_META[method] || METHOD_META.GET;
                const Icon = m.icon;
                return (
                  <tr key={log._id}>
                    {/* Method badge */}
                    <td>
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: "0.35rem",
                        padding: "0.25rem 0.65rem",
                        borderRadius: 6,
                        fontSize: "0.72rem",
                        fontWeight: 700,
                        fontFamily: "var(--font-mono)",
                        letterSpacing: "0.04em",
                        background: m.bg,
                        color: m.color,
                        border: `1px solid ${m.border}`,
                        whiteSpace: "nowrap",
                      }}>
                        <Icon /> {m.label}
                      </span>
                    </td>

                    {/* Endpoint path */}
                    <td>
                      <code style={{
                        fontSize: "0.82rem",
                        fontFamily: "var(--font-mono)",
                        color: "var(--text-primary)",
                        background: "rgba(0,0,0,0.25)",
                        padding: "0.15rem 0.5rem",
                        borderRadius: 4,
                        border: "1px solid rgba(100,116,139,0.08)",
                      }}>
                        {path}
                      </code>
                    </td>

                    {/* Role */}
                    <td><RoleBadge role={log.role} /></td>

                    {/* IP */}
                    <td>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "0.8rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.3rem" }}>
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <line x1="2" y1="12" x2="22" y2="12" />
                          <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                        </svg>
                        {log.ipAddress}
                      </span>
                    </td>

                    {/* Timestamp */}
                    <td style={{ fontFamily: "var(--font-mono)", fontSize: "0.75rem", color: "var(--text-muted)", whiteSpace: "nowrap" }}>
                      {new Date(log.timestamp).toLocaleString("en-US", { month: "short", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </PageShell>
  );
}
