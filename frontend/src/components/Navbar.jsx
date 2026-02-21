import { Link } from "react-router-dom";
import { getUserRole } from "../utils/roleCheck";
import { logout } from "../utils/logout";

export default function Navbar() {
  const role = getUserRole();

  return (
    <nav style={{
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "1rem",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      color: "white"
    }}>
      <div style={{ display: "flex", gap: "2rem", flex: 1 }}>
        <Link to="/" style={{ color: "white", textDecoration: "none", fontWeight: "bold" }}>📊 Dashboard</Link>
        <Link to="/alerts" style={{ color: "white", textDecoration: "none" }}>🚨 Alerts</Link>
        <Link to="/logs" style={{ color: "white", textDecoration: "none" }}>📝 Logs</Link>
        <Link to="/incidents" style={{ color: "white", textDecoration: "none" }}>🔴 Incidents</Link>
        {role === "ADMIN" && <Link to="/audit-logs" style={{ color: "white", textDecoration: "none" }}>📋 Audit Logs</Link>}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <span>Role: <strong>{role}</strong></span>
        <button 
          onClick={logout}
          style={{
            background: "white",
            color: "#667eea",
            border: "none",
            padding: "0.5rem 1rem",
            borderRadius: "4px",
            cursor: "pointer",
            fontWeight: "bold"
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
