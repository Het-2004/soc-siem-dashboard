import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav style={{ background: "#222", padding: "10px" }}>
      <Link to="/" style={{ color: "white", marginRight: "15px" }}>Dashboard</Link>
      <Link to="/alerts" style={{ color: "white", marginRight: "15px" }}>Alerts</Link>
      <Link to="/logs" style={{ color: "white", marginRight: "15px" }}>Logs</Link>
      <Link to="/incidents" style={{ color: "white" }}>Incidents</Link>
    </nav>
  );
}
