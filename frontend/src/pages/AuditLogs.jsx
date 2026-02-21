import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  const fetchAuditLogs = async () => {
    try {
      const res = await api.get("/audit-logs");
      setLogs(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching audit logs:", error);
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading audit logs...</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <Navbar />
      <h2>Audit Logs</h2>

      {logs.length === 0 ? (
        <p>No audit logs found.</p>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #667eea" }}>Action</th>
              <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #667eea" }}>Role</th>
              <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #667eea" }}>IP Address</th>
              <th style={{ padding: "0.75rem", textAlign: "left", borderBottom: "2px solid #667eea" }}>Timestamp</th>
            </tr>
          </thead>
          <tbody>
            {logs.map(log => (
              <tr key={log._id} style={{ borderBottom: "1px solid #ddd" }}>
                <td style={{ padding: "0.75rem" }}>{log.action}</td>
                <td style={{ padding: "0.75rem" }}>{log.role}</td>
                <td style={{ padding: "0.75rem" }}>{log.ipAddress}</td>
                <td style={{ padding: "0.75rem" }}>{new Date(log.timestamp).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
