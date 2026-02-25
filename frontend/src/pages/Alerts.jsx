import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";

export default function Alerts() {
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const getSeverityClass = (severity) => {
    if (severity === "HIGH") return "badge badge-high";
    if (severity === "MEDIUM") return "badge badge-medium";
    return "badge badge-low";
  };

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

  const filteredAlerts = alerts.filter(alert => 
    alert.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    alert.ipAddress.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="app-shell">
        <Navbar />
        <div className="page">
          <div className="state-block">Loading alerts...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h2 className="section-title">Security Alerts</h2>
          <input 
            type="text"
            className="search-input"
            placeholder="🔍 Search alerts..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {!filteredAlerts.length ? (
          <div className="state-block">No alerts found.</div>
        ) : (
          <div className="table-wrap">
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
                {filteredAlerts.map(a => (
                  <tr key={a._id}>
                    <td>{a.title}</td>
                    <td><span className={getSeverityClass(a.severity)}>{a.severity}</span></td>
                    <td>{a.ipAddress}</td>
                    <td>{a.status}</td>
                    <td>{new Date(a.createdAt).toLocaleString()}</td>
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
