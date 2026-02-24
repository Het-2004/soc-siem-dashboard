import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";

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
          <div className="state-block">Loading incidents...</div>
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
        </div>

        {incidents.length === 0 ? (
          <div className="state-block">No incidents found.</div>
        ) : (
          <div className="list-stack">
            {incidents.map(i => (
              <div key={i._id} className="list-item">
                <h3>{i.title}</h3>
                <div className="meta-row">
                  <span>
                    Severity: <span className={getSeverityClass(i.severity)}>{i.severity}</span>
                  </span>
                  <span>
                    Status: <span className={getStatusClass(i.status)}>{i.status}</span>
                  </span>
                </div>
                {i.assignedTo && (
                  <p className="meta-row">
                    Assigned To: {i.assignedTo.name} ({i.assignedTo.role})
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
