import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

  const getSeverityClass = (severity) => {
    if (severity === "HIGH") return "badge badge-high";
    if (severity === "MEDIUM") return "badge badge-medium";
    return "badge badge-low";
  };

  const getStatusClass = (status) => {
    if (status === "RESOLVED") return "badge badge-resolved";
    if (status === "INVESTIGATING") return "badge badge-investigating";
    return "badge badge-open";
  };

  useEffect(() => {
    fetchIncidents();
  }, []);

  const fetchIncidents = async () => {
    try {
      const res = await api.get("/incidents");
      setIncidents(res.data);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching incidents:", error);
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
            <p>Loading incidents...</p>
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
          <h2 className="section-title">Security Incidents</h2>
          <button className="btn-primary" onClick={fetchIncidents}>
            🔄 Refresh
          </button>
        </div>

        {incidents.length === 0 ? (
          <div className="state-block">✓ No incidents found.</div>
        ) : (
          <div className="list-stack">
            {incidents.map(i => (
              <div key={i._id} className="incident-card">
                <div className="incident-header">
                  <h3>{i.title}</h3>
                  <div className="incident-badges">
                    <span className={getSeverityClass(i.severity)}>{i.severity}</span>
                    <span className={getStatusClass(i.status)}>{i.status}</span>
                  </div>
                </div>
                {i.assignedTo && (
                  <div className="incident-assignee">
                    <span className="assignee-icon">👤</span>
                    <span>{i.assignedTo.name}</span>
                    <span className="assignee-role">({i.assignedTo.role})</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
