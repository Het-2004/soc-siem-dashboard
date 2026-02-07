// import { useEffect, useState } from "react";
// import api from "../api/api";
import Navbar from "../components/Navbar";
import { PieChart, Pie, Tooltip, Legend } from "recharts";
// import { checkBackendHealth } from "../utils/healthCheck";

// export default function Dashboard() {
//   // const [alerts, setAlerts] = useState([]);

//    useEffect(() => {
//     checkBackendHealth()
//       .then(data => console.log("Backend Status:", data.status))
//       .catch(() => console.log("Backend not reachable"));
//   }, []);


//   const data = [
//     { name: "HIGH", value: 0 },
//     { name: "MEDIUM", value: 0 },
//     { name: "LOW", value: 0 }
//   ];

//   return (
//     <>
//       <Navbar />
//       <h2>SOC Dashboard Analytics</h2>
//       <p>System health verified</p>
//       <PieChart width={400} height={300}>
//         <Pie data={data} dataKey="value" nameKey="name" />
//         <Tooltip />
//         <Legend />
//       </PieChart>
//     </>
//   );
// }

// Main SOC Dashboard
// Displays alerts summary and receives real-time notifications

export default function Dashboard() {
  return (
    <div>
      <h2>Live SOC Dashboard</h2>
      <p>System monitoring and alert visualization</p>
    </div>
  );
}
