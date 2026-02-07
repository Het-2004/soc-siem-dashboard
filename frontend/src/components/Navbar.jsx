import { Link } from "react-router-dom";
import { getUserRole } from "../utils/roleCheck";

export default function Navbar() {
  const role = getUserRole();

  return (
    <nav>
      <Link to="/">Dashboard</Link>
      <Link to="/alerts">Alerts</Link>
      <Link to="/logs">Logs</Link>
      <Link to="/incidents">Incidents</Link>

      {role === "ADMIN" && <Link to="/audit-logs">Audit Logs</Link>}
    </nav>
  );
}
