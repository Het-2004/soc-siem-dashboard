import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/logs?search=${search}&severity=${severity}`);
      setLogs(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching logs:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="page">
          <div className="state-block">
            <div className="spinner"></div>
            <p>Loading logs...</p>
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
          <h2 className="section-title">Logs Explorer</h2>
        </div>

        <div className="filters">
          <input
            className="search-input"
            placeholder="🔍 Search logs..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          <select
            className="select-input"
            value={severity}
            onChange={e => setSeverity(e.target.value)}
          >
            <option value="">All Severities</option>
            <option value="HIGH">🔴 High</option>
            <option value="MEDIUM">🟡 Medium</option>
            <option value="LOW">🟢 Low</option>
          </select>

          <button className="btn-primary" onClick={fetchLogs}>
            🔍 Filter
          </button>
        </div>

        {logs.length === 0 ? (
          <div className="state-block">📝 No logs found.</div>
        ) : (
          <div className="list-stack">
            {logs.map(log => (
              <div
                key={log._id}
                className="log-item"
                style={{
                  borderLeft: `4px solid ${log.severity === "HIGH" ? "#e74c3c" : log.severity === "MEDIUM" ? "#f39c12" : "#27ae60"}`
                }}
              >
                <div className="log-header">
                  <span className={`log-severity ${log.severity.toLowerCase()}`}>
                    {log.severity === "HIGH" ? "🔴" : log.severity === "MEDIUM" ? "🟡" : "🟢"} {log.severity}
                  </span>
                  <span className="log-type">{log.type}</span>
                </div>
                <div className="log-message">{log.message}</div>
                <div className="log-meta">
                  <span>📍 {log.ipAddress}</span>
                  <span>🕒 {new Date(log.createdAt).toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
