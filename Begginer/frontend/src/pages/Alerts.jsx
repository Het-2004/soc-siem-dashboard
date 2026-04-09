import { Fragment } from 'react';

export default function Alerts() {
    return (
        <Fragment>
            <h1 style={{ color: 'var(--accent-cyan)', marginBottom: '2rem' }}>Security Alerts</h1>

            <div className="card">
                <table className="data-table">
                    <thead>
                        <tr>
                            <th>Alert ID</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Action</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td>ALT-001</td>
                            <td>Multiple Failed Logins Detected</td>
                            <td><span style={{ color: '#dc3545', fontWeight: 'bold' }}>Active</span></td>
                            <td><button style={{ background: 'transparent', border: '1px solid var(--accent-cyan)', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Investigate</button></td>
                        </tr>
                        <tr>
                            <td>ALT-002</td>
                            <td>Malware Signature Match</td>
                            <td><span style={{ color: '#dc3545', fontWeight: 'bold' }}>Active</span></td>
                            <td><button style={{ background: 'transparent', border: '1px solid var(--accent-cyan)', color: 'white', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}>Investigate</button></td>
                        </tr>
                        <tr>
                            <td>ALT-003</td>
                            <td>Anomalous Outbound Traffic</td>
                            <td><span style={{ color: '#28a745', fontWeight: 'bold' }}>Resolved</span></td>
                            <td><button style={{ background: 'transparent', border: '1px solid #666', color: '#666', padding: '4px 8px', borderRadius: '4px' }} disabled>Investigate</button></td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </Fragment>
    );
}
