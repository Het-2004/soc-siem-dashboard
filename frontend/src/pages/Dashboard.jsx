import { useEffect, useState } from "react";
import api from "../api/api";

export default function Dashboard() {
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    api.get("/alerts").then(res => setAlerts(res.data));
  }, []);

  return (
    <div>
      <h2>SOC Dashboard</h2>
      {alerts.map(a => (
        <div key={a._id}>
          {a.title} | {a.severity}
        </div>
      ))}
    </div>
  );
}
