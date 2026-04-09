import { Fragment } from 'react';

export default function Logs() {
    const exampleLog = {
        timestamp: new Date().toISOString(),
        source: '192.168.1.5',
        destination: '10.0.0.8',
        event: 'Failed Login Attempt',
        severity: 'Medium',
        details: 'User admin failed to authenticate via SSH from remote IP.'
    };

    return (
        <Fragment>
            <h1 style={{ color: 'var(--accent-cyan)', marginBottom: '2rem' }}>System Logs</h1>

            <div className="card" style={{ marginBottom: '2rem', borderLeft: '4px solid #ffc107' }}>
                <h3>Detailed Example Log</h3>
                <pre style={{
                    backgroundColor: 'rgba(0,0,0,0.3)',
                    padding: '1rem',
                    borderRadius: '4px',
                    overflowX: 'auto',
                    color: '#e0e0e0'
                }}>
                    {JSON.stringify(exampleLog, null, 2)}
                </pre>
            </div>

            <div className="card">
                <h3>Recent Logs</h3>
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Time</th>
                            <th>Event</th>
                            <th>Source</th>
                            <th>Severity</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>{new Date().toLocaleTimeString()}</td>
                            <td>SSH Login Failed</td>
                            <td>192.168.1.5</td>
                            <td style={{ color: '#ffc107' }}>Medium</td>
                        </tr>
                        <tr>
                            <td>{new Date(Date.now() - 50000).toLocaleTimeString()}</td>
                            <td>Firewall Rules Updated</td>
                            <td>System</td>
                            <td style={{ color: '#28a745' }}>Info</td>
                        </tr>
                        <tr>
                            <td>{new Date(Date.now() - 150000).toLocaleTimeString()}</td>
                            <td>Port Scan Detected</td>
                            <td>10.0.0.22</td>
                            <td style={{ color: '#dc3545' }}>High</td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Fragment>
    );
}
