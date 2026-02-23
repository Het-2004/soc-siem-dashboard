import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { PieChart, Pie, Tooltip, Legend, LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

// Main SOC Dashboard
// Displays alerts summary and receives real-time notifications

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [trends, setTrends] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const statsRes = await api.get("/stats").catch(err => {
        console.error("Stats error:", err);
        return null;
      });
      
      const trendsRes = await api.get("/trends").catch(err => {
        console.error("Trends error:", err);
        return null;
      });

      if (statsRes) setStats(statsRes.data);
      if (trendsRes) setTrends(trendsRes.data);
      
      setLoading(false);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setError("Failed to load dashboard data");
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div style={{ padding: "2rem", textAlign: "center" }}>
          <p>Loading dashboard...</p>
        </div>
      </>
    );
  }

  const chartData = stats 
    ? [
        { name: "HIGH", value: stats.high || 0 },
        { name: "MEDIUM", value: stats.medium || 0 },
        { name: "LOW", value: stats.low || 0 }
      ]
    : [];

  return (
    <>
      <Navbar />
      <div style={{ padding: "2rem" }}>
        <h2>SOC Dashboard Analytics</h2>
        
        {error && (
          <div style={{ padding: "1rem", background: "#ffebee", color: "#e74c3c", borderRadius: "4px", marginBottom: "1rem" }}>
            {error}
          </div>
        )}
        
        {stats && (
          <div style={{ display: "flex", gap: "2rem", marginBottom: "2rem", flexWrap: "wrap" }}>
            <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: "8px", minWidth: "150px" }}>
              <h3>Total Alerts</h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#667eea" }}>{stats.total || 0}</p>
            </div>
            <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: "8px", minWidth: "150px" }}>
              <h3>High Severity</h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#e74c3c" }}>{stats.high || 0}</p>
            </div>
            <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: "8px", minWidth: "150px" }}>
              <h3>Medium Severity</h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#f39c12" }}>{stats.medium || 0}</p>
            </div>
            <div style={{ padding: "1rem", background: "#f5f5f5", borderRadius: "8px", minWidth: "150px" }}>
              <h3>Low Severity</h3>
              <p style={{ fontSize: "2rem", fontWeight: "bold", color: "#27ae60" }}>{stats.low || 0}</p>
            </div>
          </div>
        )}

        <div style={{ display: "flex", gap: "2rem", flexWrap: "wrap" }}>
          {chartData.length > 0 && (
            <div>
              <h3>Alert Severity Distribution</h3>
              <PieChart width={400} height={300}>
                <Pie data={chartData} dataKey="value" nameKey="name" />
                <Tooltip />
                <Legend />
              </PieChart>
            </div>
          )}

          {trends.length > 0 && (
            <div>
              <h3>7-Day Alert Trend</h3>
              <ResponsiveContainer width={400} height={300}>
                <LineChart data={trends}>
                  <CartesianGrid />
                  <XAxis dataKey="_id" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#667eea" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

