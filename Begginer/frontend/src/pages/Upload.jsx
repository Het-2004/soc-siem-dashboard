import { Fragment, useState } from 'react';

export default function Upload() {
    const [file, setFile] = useState(null);
    const [status, setStatus] = useState('');

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
            setStatus('');
        }
    };

    const handleUpload = (e) => {
        e.preventDefault();
        if (!file) {
            setStatus('Please select a file first.');
            return;
        }

        // Mock upload process
        setStatus('Uploading...');
        setTimeout(() => {
            setStatus(`Success! ${file.name} uploaded and is being analyzed.`);
            setFile(null);
        }, 1500);
    };

    return (
        <Fragment>
            <h1 style={{ color: 'var(--accent-cyan)', marginBottom: '2rem' }}>Upload Log Files</h1>

            <div className="card">
                <h3>Submit System Logs for Analysis</h3>
                <p>You can upload raw `.log`, `.csv`, or `.json` files here to be parsed by the SOC SIEM backend.</p>

                <form className="upload-form" onSubmit={handleUpload}>
                    <input
                        type="file"
                        accept=".log,.txt,.csv,.json"
                        onChange={handleFileChange}
                    />
                    <button type="submit" className="btn-upload">Upload File</button>
                </form>

                {status && (
                    <div style={{
                        marginTop: '1rem',
                        padding: '1rem',
                        backgroundColor: status.includes('Success') ? 'rgba(40, 167, 69, 0.2)' : 'rgba(220, 53, 69, 0.2)',
                        color: status.includes('Success') ? '#28a745' : '#dc3545',
                        borderRadius: '4px',
                        border: `1px solid ${status.includes('Success') ? '#28a745' : '#dc3545'}`
                    }}>
                        {status}
                    </div>
                )}
            </div>
        </Fragment>
    );
}
