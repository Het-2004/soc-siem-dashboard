import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);
  const [loading, setLoading] = useState(true);

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
    return <p>Loading incidents...</p>;
  }

  return (
    <div style={{ padding: "2rem" }}>
      <Navbar />
      <h2>Security Incidents</h2>

      {incidents.length === 0 ? (
        <p>No incidents found.</p>
      ) : (
        <div>
          {incidents.map(i => (
            <div 
              key={i._id}
              style={{
                padding: "1rem",
                marginBottom: "1rem",
                background: "#f9f9f9",
                border: "1px solid #ddd",
                borderRadius: "8px"
              }}
            >
              <h3>{i.title}</h3>
              <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
                <div>
                  <strong>Severity:</strong> <span style={{ color: i.severity === "HIGH" ? "#e74c3c" : "#f39c12" }}>{i.severity}</span>
                </div>
                <div>
                  <strong>Status:</strong> <span style={{ color: i.status === "RESOLVED" ? "#27ae60" : i.status === "INVESTIGATING" ? "#f39c12" : "#e74c3c" }}>{i.status}</span>
                </div>
              </div>
              {i.assignedTo && (
                <p><strong>Assigned To:</strong> {i.assignedTo.name} ({i.assignedTo.role})</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
