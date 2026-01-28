import { useEffect, useState } from "react";
import api from "../api/api";

export default function Incidents() {
  const [incidents, setIncidents] = useState([]);

  useEffect(() => {
    api.get("/incidents").then(res => setIncidents(res.data));
  }, []);

  return (
    <div>
      <h2>Incidents</h2>
      {incidents.map(i => (
        <div key={i._id}>
          {i.title} - {i.status}
        </div>
      ))}
    </div>
  );
}
