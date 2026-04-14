# SOC SIEM Dashboard Data Flow

This document outlines the data flow architecture for the project, detailing how log data moves from endpoint agents through the backend processing pipeline and finally to the frontend presentation layer. This is perfect for inclusion in an internship project report.

## Data Flow Diagram

```mermaid
%%{init: {'theme': 'neutral', 'themeVariables': { 'background': '#ffffff', 'primaryTextColor': '#000000', 'lineColor': '#333333'}}}%%
flowchart TD
    %% Define Styles
    classDef source fill:#dbeafe,stroke:#1e3a8a,stroke-width:2px,color:#1e3a8a
    classDef backend fill:#d1fae5,stroke:#064e3b,stroke-width:2px,color:#064e3b
    classDef db fill:#fee2e2,stroke:#7f1d1d,stroke-width:2px,color:#7f1d1d
    classDef frontend fill:#f3e8ff,stroke:#4c1d95,stroke-width:2px,color:#4c1d95

    subgraph Data_Sources ["1. Data Collection (Endpoints)"]
        WA[("Windows Event Agent\n(Powershell)")]:::source
        LA[("Linux Auth Agent\n(Bash/SH)")]:::source
    end

    subgraph Backend_Processing ["2. Backend Processing (Node.js & Express)"]
        ING[("Ingest API\n(routes/ingest.routes.js)")]:::backend
        MW[("Security & Middlewares\n(Rate Limiting, IP Block)")]:::backend
        DET[("Threat Detection Engine\n(utils/detector.js)")]:::backend
        JOB[("Auto-Incident Job\n(jobs/autoIncident.js)")]:::backend
        API[("REST API Controllers\n(Alerts, Logs, Auth)")]:::backend
    end

    subgraph Database ["3. Storage (MongoDB)"]
        DB_LOG[(Logs Collection)]:::db
        DB_ALT[(Alerts Collection)]:::db
        DB_INC[(Incidents Collection)]:::db
        DB_AUD[(Audit & Users Collection)]:::db
    end

    subgraph Frontend_UI ["4. Frontend Presentation (React & Vite)"]
        CLIENT[("API Client\n(api/api.js)")]:::frontend
        DASH[("Dashboard & Threat Map\n(Data Aggegation)")]:::frontend
        VIEWS[("Log, Alerts & Incidents\n(Detailed Views)")]:::frontend
    end

    %% Flow Connections
    WA -- "POST Logs (JSON)" --> MW
    LA -- "POST Logs (JSON)" --> MW
    
    MW -- "Validated Payload" --> ING
    ING -- "Raw Logs" --> DB_LOG
    ING -- "Analyze Log Data" --> DET
    
    DET -- "Suspicious Activity Detected" --> DB_ALT
    DET -- "Trigger Auto-Incident" --> JOB
    JOB -- "Create Incident" --> DB_INC

    CLIENT -- "Fetch/Update (JWT Auth)" --> API
    API -- "Query Data" --> DB_LOG
    API -- "Query Data" --> DB_ALT
    API -- "Query/Update Data" --> DB_INC
    API -- "Auth & Audit" --> DB_AUD
    
    CLIENT --> DASH
    CLIENT --> VIEWS
```

## Flow Breakdown

### 1. Data Collection (Agents)
Endpoint scripts (`windows-event-agent.ps1` and `linux-auth-agent.sh`) monitor OS-level events and send formatted JSON payloads to the backend's ingestion endpoints.

### 2. Ingestion & Processing
The request hits the Express backend and passes through middleware for security (Rate Limiting, IP Blocker). The raw log is stored in the database, while simultaneously being passed to `utils/detector.js` where security rules are applied.

### 3. Alert & Incident Generation
If `detector.js` flags suspicious activity, it generates an **Alert**. Automated workers (`jobs/autoIncident.js`) then group critical alerts into structured **Incidents** for investigation.

### 4. Data Presentation
The React frontend securely requests this processed data via the REST API controllers (authenticating with JWT and RBAC). The UI populates the charts on the Dashboard, draws geospatial data on the Threat map, and lists the actionable Alerts and Incidents for SOC analysts to review.
