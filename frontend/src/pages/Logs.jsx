import { useEffect, useState } from "react";
import api from "../api/api";

export default function Logs() {
  const [logs, setLogs] = useState([]);
  const [search, setSearch] = useState("");
  const [severity, setSeverity] = useState("");

  const fetchLogs = () => {
    api.get(`/logs?search=${search}&severity=${severity}`)
      .then(res => setLogs(res.data));
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  return (
    <div>
      <h2>Logs Explorer</h2>

      <input
        placeholder="Search logs..."
        onChange={e => setSearch(e.target.value)}
      />

      <select onChange={e => setSeverity(e.target.value)}>
        <option value="">All</option>
        <option value="HIGH">High</option>
        <option value="MEDIUM">Medium</option>
        <option value="LOW">Low</option>
      </select>

      <button onClick={fetchLogs}>Filter</button>

      {logs.map(log => (
        <div key={log._id}>
          [{log.severity}] {log.message}
        </div>
      ))}
    </div>
  );
}
