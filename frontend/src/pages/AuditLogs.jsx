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
    return (
      <div className="app-shell">
        <Navbar />
        <div className="page">
          <div className="state-block">Loading audit logs...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h2 className="section-title">Audit Logs</h2>
        </div>

        {logs.length === 0 ? (
          <div className="state-block">No audit logs found.</div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Action</th>
                  <th>Role</th>
                  <th>IP Address</th>
                  <th>Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {logs.map(log => (
                  <tr key={log._id}>
                    <td>{log.action}</td>
                    <td>{log.role}</td>
                    <td>{log.ipAddress}</td>
                    <td>{new Date(log.timestamp).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
