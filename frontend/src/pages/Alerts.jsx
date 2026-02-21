import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/alerts")
      .then(res => {
        setAlerts(res.data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching alerts:", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading alerts...</p>;
  }

  if (!alerts.length) {
    return (
      <div>
        <Navbar />
        <h2>Alerts</h2>
        <p>No alerts detected.</p>
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <h2>Security Alerts</h2>
      <table>
        <thead>
          <tr>
            <th>Title</th>
            <th>Severity</th>
            <th>IP Address</th>
            <th>Status</th>
            <th>Created At</th>
          </tr>
        </thead>
        <tbody>
          {alerts.map(a => (
            <tr key={a._id}>
              <td>{a.title}</td>
              <td>{a.severity}</td>
              <td>{a.ipAddress}</td>
              <td>{a.status}</td>
              <td>{new Date(a.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
