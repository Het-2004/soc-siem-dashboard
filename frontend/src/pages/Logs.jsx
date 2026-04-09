import { useEffect, useState, useRef } from "react";
import api from "../api/api";
import PageShell from "../components/PageShell";

const SEV_COLOR = {
  HIGH: { color: "#ff3366", bg: "rgba(255,51,102,0.12)", border: "rgba(255,51,102,0.25)", label: "CRIT" },
  MEDIUM: { color: "#ff9f43", bg: "rgba(255,159,67,0.12)", border: "rgba(255,159,67,0.25)", label: "WARN" },
  LOW: { color: "#00ff88", bg: "rgba(0,255,136,0.1)", border: "rgba(0,255,136,0.2)", label: "INFO" },
};

const TYPE_COLOR = {
  AUTH: "#a855f7",
  API: "#00d4ff",
  SECURITY: "#ff3366",
  SYSTEM: "#00ff88",
  NETWORK: "#ff9f43",
  INTRUSION: "#ff3366",
  ERROR: "#ff3366",
  ALERT: "#ff9f43",
};

const fmtTime = (d) => {
  const dt = new Date(d);
  return `${dt.toLocaleDateString("en-CA")} ${dt.toLocaleTimeString("en-US", { hour12: false })}`;
};

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [loading, setLoading] = useState(true);
  const [autoScroll, setAutoScroll] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => { fetchLogs(); }, []);

  useEffect(() => {
    if (autoScroll && bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs, autoScroll]);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/logs?search=${search}&severity=${severity}`);
      setLogs(res.data);
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = (e) => {
    e.preventDefault();
    fetchLogs();
  };

  const counts = {
    high: logs.filter(l => l.severity === "HIGH").length,
    medium: logs.filter(l => l.severity === "MEDIUM").length,
    low: logs.filter(l => l.severity === "LOW").length,
  };

  if (loading) {
    return (
      <PageShell title="Log Explorer">
        <div className="state-block" style={{ paddingTop: "4rem" }}>
          <div className="spinner" />
          <p style={{ marginTop: "1rem", color: "var(--text-muted)", fontFamily: "var(--font-mono)", fontSize: "0.85rem" }}>
            Streaming log data…
          </p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Log Explorer"
      subtitle={`${logs.length} entries`}
      actions={
        <button className="btn-primary" onClick={fetchLogs} style={{ fontSize: "0.8rem", padding: "0.35rem 0.85rem" }}>
          ↻ Refresh
        </button>
      }
    >
      {/* Header */}
      <div className="page-header">
        <div>
          <h2 className="section-title">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
            </svg>
            Log Explorer
          </h2>
          <div className="section-subtitle">Real-time security event feed · sorted newest first</div>
        </div>

        {/* Stat chips */}
        <div style={{ display: "flex", gap: "0.5rem", alignItems: "center", flexWrap: "wrap" }}>
          <span className="badge badge-high">{counts.high} High</span>
          <span className="badge badge-medium">{counts.medium} Med</span>
          <span className="badge badge-low">{counts.low} Low</span>
        </div>
      </div>

      {/* Filters */}
      <form onSubmit={handleFilter} style={{ display: "flex", gap: "0.6rem", flexWrap: "wrap", marginBottom: "1rem" }}>
        <input
          className="search-input"
          placeholder="⌕  Search log message…"
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 200 }}
        />
        <select
          className="select-input"
          value={severity}
          onChange={e => setSeverity(e.target.value)}
        >
          <option value="">All Severities</option>
          <option value="HIGH">● CRITICAL</option>
          <option value="MEDIUM">● WARNING</option>
          <option value="LOW">● INFO</option>
        </select>
        <button type="submit" className="btn-primary">Filter</button>
        <button
          type="button"
          className="btn-primary"
          style={autoScroll ? { borderColor: "var(--neon-green)", color: "var(--neon-green)" } : {}}
          onClick={() => setAutoScroll(p => !p)}
          title="Toggle auto-scroll to newest"
        >
          {autoScroll ? "↓ Live" : "↓ Follow"}
        </button>
      </form>

      {/* Terminal viewer */}
      {logs.length === 0 ? (
        <div className="state-block">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="1.5" style={{ marginBottom: "0.75rem" }}>
            <polyline points="4 17 10 11 4 5" /><line x1="12" y1="19" x2="20" y2="19" />
          </svg>
          <p style={{ color: "var(--text-muted)", fontFamily: "var(--font-mono)" }}>No log entries match your filter.</p>
        </div>
      ) : (
        <div className="terminal-viewer">
          {/* Terminal chrome */}
          <div className="terminal-chrome">
            <span className="terminal-dot red" />
            <span className="terminal-dot yellow" />
            <span className="terminal-dot green" />
            <span className="terminal-title">SOC LOG STREAM — {logs.length} records</span>
          </div>
          {/* Terminal body */}
          <div className="terminal-body">
            {logs.map((log, idx) => {
              const sev = SEV_COLOR[log.severity] || SEV_COLOR.LOW;
              const typeColor = TYPE_COLOR[log.type?.toUpperCase()] || "#94a3b8";
              return (
                <div key={log._id} className="terminal-row">
                  {/* Line number */}
                  <span className="terminal-ln">{String(idx + 1).padStart(4, "0")}</span>

                  {/* Timestamp */}
                  <span className="terminal-ts">{fmtTime(log.createdAt)}</span>

                  {/* Severity pill */}
                  <span
                    className="terminal-sev"
                    style={{ color: sev.color, background: sev.bg, border: `1px solid ${sev.border}` }}
                  >
                    {sev.label}
                  </span>

                  {/* Type tag */}
                  <span className="terminal-type" style={{ color: typeColor }}>
                    [{log.type || "SYS"}]
                  </span>

                  {/* Message */}
                  <span className="terminal-msg">{log.message}</span>

                  {/* IP */}
                  <span className="terminal-ip">
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" /><line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 010 20M12 2a15.3 15.3 0 000 20" />
                    </svg>
                    {" "}{log.ipAddress}
                  </span>
                </div>
              );
            })}
            <div ref={bottomRef} />
          </div>
        </div>
      )}
    </PageShell>
  );
}
