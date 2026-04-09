# SOC SIEM Dashboard (Beginner)

## Overview
This project is a centralized **SOC (Security Operations Center) SIEM (Security Information and Event Management) Dashboard**. It provides a user interface and a backend server to manage and visualize security logs, alerts, user authentication, and file analysis. 

## Technology Stack
- **Frontend**: React.js (Vite), React Router DOM, Axios for API communication.
- **Backend**: Node.js, Express.js.
- **Database**: MongoDB (Mongoose ODM).
- **Authentication**: JSON Web Tokens (JWT) and bcryptjs for secure password hashing.

## Features Implemented So Far

### 1. Authentication & Authorization
- **User Registration**: Create new accounts securely (passwords hashed via bcrypt).
- **User Login**: Authenticate users and issue JWTs for session management.
- **Protected Routes**: Dashboard and other internal pages are secured, requiring authentication.

### 2. Frontend Application Structure
- **Routing**: Client-side routing managed by React Router.
- **Pages**:
  - `/login` & `/register`: Authentication portal.
  - `/dashboard`: Main overview and statistics placeholder.
  - `/logs`: Interface to view and filter security logs.
  - `/alerts`: Dashboard to monitor triggered security alerts.
  - `/upload`: Page for uploading files/suspect binaries for potential analysis.
- **Layouts**: A persistent Layout component for navigation and standard UI framing across internal pages.

### 3. Backend Architecture
- **API Server**: Express app running on port 5000 with CORS and JSON parsing enabled.
- **Auth Routes**: Handle registration, login, and validation.
- **Database Connection**: Configured to connect to a local MongoDB instance (`beginner_project`).

---

## Next Features to Add

To evolve this project from a beginner structure to a full-fledged SIEM dashboard, the following features are planned:

1. **Real-time Log Ingestion & Display**
   - Implement WebSockets (e.g., Socket.io) to push live logs to the frontend without refreshing.
   - Build endpoints for external agents to forward logs securely.

2. **Advanced SIEM Rules & Alerting**
   - Create a rule engine to detect anomalies (e.g., multiple failed logins, unexpected port accesses).
   - Send email or webhook notifications when critical alerts are generated.

3. **Data Visualization**
   - Integrate charting libraries (like Recharts or Chart.js) into the Dashboard for visual analytics (e.g., events over time, severity distributions).

4. **Threat Intelligence Integration**
   - Connect to APIs like VirusTotal, AlienVault OTX, or IBM X-Force to enrich IP addresses, URLs, and file hashes.

5. **Role-Based Access Control (RBAC)**
   - Introduce Admin and Analyst roles to restrict actions like rule creation or user management.

6. **File/Malware Analysis Sandbox**
   - Enhance the Upload page to submit files to a backend service that performs basic static/dynamic analysis or checks file hashes against known threat databases.

7. **Audit Logging**
   - Track actions taken by users within the dashboard (e.g., acknowledging an alert) for compliance and integrity.
