import { useEffect, useState } from "react";
import api from "../api/api";

export default function AuditLogs() {
  const [logs, setLogs] = useState([]);

  useEffect(() => {
    api.get("/audit-logs").then(res => setLogs(res.data));
  }, []);

  return (
    <div>
      <h2>Audit Logs</h2>
      {logs.map(log => (
        <div key={log._id}>
          {log.action} | {log.role} | {log.ipAddress}
        </div>
      ))}
    </div>
  );
}
