import { Link, Outlet, useNavigate } from 'react-router-dom';
import '../App.css';

export default function Layout() {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className="layout">
            <nav className="sidebar">
                <div className="sidebar-header">
                    <h2>SOC SIEM</h2>
                </div>
                <ul className="nav-links">
                    <li><Link to="/dashboard">Dashboard</Link></li>
                    <li><Link to="/logs">Logs</Link></li>
                    <li><Link to="/alerts">Alerts</Link></li>
                    <li><Link to="/upload">Upload</Link></li>
                </ul>
                <div className="sidebar-footer">
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </nav>
            <main className="main-content">
                <Outlet />
            </main>
        </div>
    );
}
