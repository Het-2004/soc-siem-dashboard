import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";

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
    return <p>Loading logs...</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <Navbar />
      <h2>Logs Explorer</h2>

      <div style={{ marginBottom: "1rem", display: "flex", gap: "1rem" }}>
        <input
          placeholder="Search logs..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
        />

        <select 
          value={severity}
          onChange={e => setSeverity(e.target.value)}
          style={{ padding: "0.5rem", borderRadius: "4px", border: "1px solid #ddd" }}
        >
          <option value="">All Severities</option>
          <option value="HIGH">High</option>
          <option value="MEDIUM">Medium</option>
          <option value="LOW">Low</option>
        </select>

        <button 
          onClick={fetchLogs}
          style={{ padding: "0.5rem 1rem", background: "#667eea", color: "white", border: "none", borderRadius: "4px", cursor: "pointer" }}
        >
          Filter
        </button>
      </div>

      {logs.length === 0 ? (
        <p>No logs found.</p>
      ) : (
        <div>
          {logs.map(log => (
            <div 
              key={log._id}
              style={{
                padding: "1rem",
                marginBottom: "0.5rem",
                background: log.severity === "HIGH" ? "#ffebee" : log.severity === "MEDIUM" ? "#fff3e0" : "#e8f5e9",
                borderLeft: `4px solid ${log.severity === "HIGH" ? "#e74c3c" : log.severity === "MEDIUM" ? "#f39c12" : "#27ae60"}`,
                borderRadius: "4px"
              }}
            >
              <strong>[{log.severity}]</strong> {log.message}
              <small style={{ display: "block", color: "#666", marginTop: "0.5rem" }}>
                Type: {log.type} | IP: {log.ipAddress} | {new Date(log.createdAt).toLocaleString()}
              </small>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
