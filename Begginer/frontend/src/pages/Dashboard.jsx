import { Fragment } from 'react';

export default function Dashboard() {
    return (
        <Fragment>
            <h1 style={{ color: 'var(--accent-cyan)', marginBottom: '2rem' }}>Main Dashboard</h1>

            <div className="stats-grid">
                <div className="stat-card">
                    <h4>Total Events</h4>
                    <div className="value">1,245</div>
                </div>
                <div className="stat-card">
                    <h4>Active Alerts</h4>
                    <div className="value">12</div>
                </div>
                <div className="stat-card">
                    <h4>Logs Parsed</h4>
                    <div className="value">890</div>
                </div>
            </div>

            <div className="card">
                <h3>System Overview</h3>
                <p>The SOC SIEM Dashboard is monitoring the environment. All systems look stable. Use the sidebar to navigate to Logs, Alerts, or Upload new log sets.</p>
            </div>
        </Fragment>
    );
}
