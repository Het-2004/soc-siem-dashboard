import { Link } from "react-router-dom";
import { logout } from "../utils/logout";

export default function Navbar() {
  return (
    <nav style={{ background: "#222", padding: "10px" }}>
      <Link to="/" style={{ color: "white", marginRight: "10px" }}>Dashboard</Link>
      <Link to="/alerts" style={{ color: "white", marginRight: "10px" }}>Alerts</Link>
      <Link to="/logs" style={{ color: "white", marginRight: "10px" }}>Logs</Link>
      <Link to="/incidents" style={{ color: "white", marginRight: "10px" }}>Incidents</Link>
      <button onClick={logout}>Logout</button>
    </nav>
  );
}
