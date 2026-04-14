# 🏛️ Architecture & Project Structure: SOC Command Center

---

## 1. High-Level System Architecture

```mermaid
%%{init: {'theme': 'default', 'themeVariables': { 'background': '#ffffff', 'primaryTextColor': '#000000', 'lineColor': '#333333', 'clusterBkg': '#f8fafc', 'clusterBorder': '#94a3b8'}}}%%
graph TD
    classDef edge fill:#dbeafe,stroke:#1e3a8a,stroke-width:2px,color:#1e3a8a
    classDef cloud fill:#d1fae5,stroke:#064e3b,stroke-width:2px,color:#064e3b
    classDef db fill:#fee2e2,stroke:#7f1d1d,stroke-width:2px,color:#7f1d1d
    classDef ui fill:#f3e8ff,stroke:#4c1d95,stroke-width:2px,color:#4c1d95

    subgraph "1. Edge Network (Log Sources)"
        A[Web Servers / Nginx]:::edge -->|Tail logs| B(Python Agent `soc_agent.py`):::edge
        C[Windows Servers]:::edge -->|Read EventLogs| D(PowerShell Agent `soc_agent_windows.ps1`):::edge
    end

    subgraph "2. Cloud Backend (Node.js + Express)"
        B -- POST (JSON) --> E{`/api/ingest`}:::cloud
        D -- POST (JSON) --> E
        
        E --> F[Threat Detection Engine]:::cloud
        F -->|Rule Match| G[Alert Generator]:::cloud
        F -->|Safe| H[(MongoDB Atlas)]:::db
        G --> H
    end

    subgraph "3. Command Center (React + WebSockets)"
        G -- Socket.IO (Real-time) --> I[React Frontend]:::ui
        H -- REST API (Fetch) --> I
        I --> J[Analyst Dashboard]:::ui
        I --> K[Threat Map / Leaflet]:::ui
    end
```

---

## 2. Directory Structure

### Root Directory
```text
soc-siem-dashboard/
├── backend/                  # Node.js + Express API & Brain
├── frontend/                 # React.js + Vite UI
├── docs/                     # Agents, Guides, and Architecture
├── auto_commit.ps1           # Git automation script
├── DEVELOPMENT_LOG.md        # Daily work log
├── PROJECT_PRESENTATION.md   # Presentation script & tech deep-dive
└── README.md                 # Public high-level repository overview
```

### Backend Structure (Core Engine)
```text
backend/
├── controllers/              # Business logic (handle requests)
│   ├── auth.controller.js
│   ├── log.controller.js
│   ├── alert.controller.js
│   └── incident.controller.js
├── models/                   # MongoDB Mongoose schemas
│   ├── User.js
│   ├── Log.js
│   ├── Alert.js
│   └── Incident.js
├── routes/                   # API Endpoints
│   ├── auth.routes.js
│   ├── log.routes.js
│   ├── alert.routes.js
│   ├── incident.routes.js
│   └── ingest.routes.js      # Endpoint for Agents
├── middlewares/              # Express interceptors
│   ├── auth.middleware.js    # JWT verification
│   ├── rbac.middleware.js    # Role-based access control
│   ├── rateLimiter.js        # DDoS protection
│   └── auditLogger.js        # User action tracking
├── utils/                    
│   └── detector.js           # Core Threat Detection Logic
├── config/
│   └── db.js                 # MongoDB connection
└── server.js                 # Express Entry Point
```

### Frontend Structure (React UI)
```text
frontend/src/
├── api/                      # Axios instance config
│   └── api.js
├── auth/                     # Authentication views & logic
│   ├── Login.jsx
│   └── ProtectedRoute.jsx
├── components/               # Reusable UI parts
│   ├── CyberBackground.jsx   # Animated canvas
│   ├── Navbar.jsx
│   ├── Footer.jsx
│   └── ThreatMap.jsx         # Leaflet real-world map
├── context/
│   ├── AuthContext.jsx       # Global state for user session
│   └── TransitionContext.jsx # Global UI transitions
├── pages/                    # Main routing views
│   ├── Dashboard.jsx         # KPIs, Charts, Map
│   ├── Alerts.jsx            # Alert management
│   ├── Logs.jsx              # Terminal-style explorer
│   ├── AuditLogs.jsx         # History tracking
│   └── Incidents.jsx         # Incident lifecycle management
├── styles/                   # CSS System
│   ├── index.css             # Theme variables & typography
│   ├── App.css               # Component layout
│   └── auth.css              # Cyberpunk login visuals
├── App.jsx                   # React Router hub
└── main.jsx                  # React Entry Point
```

---

## 3. Incident Escalation Flow

```mermaid
%%{init: {'theme': 'default', 'themeVariables': { 'background': '#ffffff', 'actorBkg': '#dbeafe', 'actorBorder': '#1e3a8a', 'actorTextColor': '#000000', 'noteBkg': '#fef3c7', 'noteBorder': '#b45309', 'signalColor': '#333333', 'signalTextColor': '#000000'}}}%%
sequenceDiagram
    participant Agent as Edge Agent
    participant Engine as Threat Engine
    participant UI as React Dashboard
    participant Analyst as SOC Analyst

    Agent->>Engine: Send raw log (POST /ingest)
    Engine->>Engine: Scan against OWASP signatures
    alt Threat Detected
        Engine->>Engine: Generate Alert
        Engine-->>UI: Socket.IO web socket (emit realtime trigger)
        UI->>Analyst: Display red toast notification
        Analyst->>UI: Review alert in dashboard
        Analyst->>Engine: Escalate Alert to Incident
        Engine->>Engine: Create Incident (Status: OPEN)
    else Safe
        Engine->>Engine: Store silently in MongoDB
    end
```
