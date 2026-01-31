import { useEffect, useState } from "react";
import api from "../api/api";
import Navbar from "../components/Navbar";
import { PieChart, Pie, Tooltip, Legend } from "recharts";

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.get("/alerts").then(res => setAlerts(res.data));
  }, []);

  const data = [
    { name: "HIGH", value: alerts.filter(a => a.severity === "HIGH").length },
    { name: "MEDIUM", value: alerts.filter(a => a.severity === "MEDIUM").length },
    { name: "LOW", value: alerts.filter(a => a.severity === "LOW").length }
  ];

  return (
    <>
      <Navbar />
      <h2>SOC Dashboard Analytics</h2>

      <PieChart width={400} height={300}>
        <Pie data={data} dataKey="value" nameKey="name" />
        <Tooltip />
        <Legend />
      </PieChart>
    </>
  );
}
