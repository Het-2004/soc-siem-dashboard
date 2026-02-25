import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
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
      <div className="app-shell">
        <Navbar />
        <div className="page">
          <div className="state-block">
            <div className="spinner"></div>
            <p>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  const chartData = stats 
    ? [
        { name: "HIGH", value: stats.high || 0, fill: "#e74c3c" },
        { name: "MEDIUM", value: stats.medium || 0, fill: "#f39c12" },
        { name: "LOW", value: stats.low || 0, fill: "#27ae60" }
      ]
    : [];

  return (
    <div className="app-shell">
      <Navbar />
      <div className="page">
        <div className="page-header">
          <h2 className="section-title">SOC Dashboard Analytics</h2>
          <button className="btn-primary" onClick={fetchData} disabled={loading}>
            🔄 Refresh
          </button>
        </div>

        {error && (
          <div className="alert alert-error">
            {error}
          </div>
        )}

        {stats && (
          <div className="kpi-grid">
            <div className="kpi-card">
              <div className="kpi-icon">📊</div>
              <div className="kpi-label">Total Alerts</div>
              <div className="kpi-value" style={{ color: "#667eea" }}>{stats.total || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">🔴</div>
              <div className="kpi-label">High Severity</div>
              <div className="kpi-value" style={{ color: "#e74c3c" }}>{stats.high || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">🟡</div>
              <div className="kpi-label">Medium Severity</div>
              <div className="kpi-value" style={{ color: "#f39c12" }}>{stats.medium || 0}</div>
            </div>
            <div className="kpi-card">
              <div className="kpi-icon">🟢</div>
              <div className="kpi-label">Low Severity</div>
              <div className="kpi-value" style={{ color: "#27ae60" }}>{stats.low || 0}</div>
            </div>
          </div>
        )}

        <div className="chart-grid">
          {chartData.length > 0 && (
            <div className="card">
              <div className="card-title">Alert Severity Distribution</div>
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie data={chartData} dataKey="value" nameKey="name" />
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}

          {trends.length > 0 && (
            <div className="card">
              <div className="card-title">7-Day Alert Trend</div>
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="_id" stroke="#666" />
                  <YAxis stroke="#666" />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#fff', 
                      border: '1px solid #ddd',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#667eea" 
                    strokeWidth={3}
                    dot={{ fill: '#667eea', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
}

