# 🔐 SOC Command Center
### Security Operations Center — Full-Stack MERN Platform

> A professional-grade, real-time **Security Information & Event Management (SIEM)** and **Security Operations Center (SOC)** platform. Inspired by enterprise tools like **Splunk**, **Elastic SIEM**, and **Microsoft Sentinel**.

**Final Year Project | Computer Engineering | 2025–2026**

---

## 📌 Project Overview

The **SOC Command Center** is a centralized platform to **monitor system logs**, **detect threats in real time**, **manage security alerts**, and **respond to incidents** — all through a premium dark cyberpunk-themed interface.

It follows industry-standard security principles:
- **OWASP Top 10** (input validation, auth, logging)
- **NIST Cybersecurity Framework** (Identify → Protect → Detect → Respond → Recover)
- **Zero Trust** architecture concepts

---

## 🧰 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, Recharts, Leaflet.js, Socket.IO Client |
| **Backend** | Node.js, Express.js, Mongoose |
| **Database** | MongoDB Atlas |
| **Auth** | JWT (JSON Web Tokens), bcrypt |
| **Real-Time** | Socket.IO WebSocket |
| **Security** | RBAC, Rate Limiting, Helmet.js, CORS |
| **Agents** | Python (`soc_agent.py`), PowerShell (`soc_agent_windows.ps1`) |
| **CI/CD & Deploy** | GitHub Actions, Render (Backend API), Vercel (Frontend React) |

---

## ✅ Implemented Features

### 🔐 Authentication & Security
- User registration and login with bcrypt password hashing
- JWT-based stateless session authentication
- Role-Based Access Control — ADMIN and ANALYST roles
- Protected frontend routes with automatic redirect on token expiry
- Cinematic "ACCESS GRANTED" login transition animation

### 📊 Dashboard
- Live KPI cards — Threats Blocked, Active Alerts, Open Incidents, Uptime
- Real-time alert feed via Socket.IO WebSocket
- Interactive Threat Map (Leaflet.js) centered on **Gujarat, India** with geo-attack visualization
- Severity distribution charts (Recharts PieChart + BarChart)
- Recent alerts summary table

### 🚨 Alerts Management
- Full alert listing with severity filter (CRITICAL / HIGH / MEDIUM / LOW)
- Real-time new alert push via Socket.IO
- Alert detail view — source IP, timestamp, triggered rule

### 🗂️ Incident Management
- Alert-to-incident escalation workflow
- Incident lifecycle: OPEN → INVESTIGATING → RESOLVED
- Analyst assignment, notes, and audit trail

### 📋 Log Explorer
- Terminal-style monospace viewer with level-color coding
- Full-text search, level filter (INFO / WARN / ERROR / CRITICAL)
- Time-range filtering

### 📁 Audit Logs
- HTTP method indicators (GET / POST / PUT / DELETE)
- User action tracking across the entire platform
- Exportable audit trail

### 🎨 UI / UX
- Premium dark cyberpunk design system with CSS variables and glassmorphism
- Animated CyberBackground — matrix rain + hexagonal grid + radar sweep
- Dark glass sidebar with live clock and neon navigation
- Animated stat counters and live threat ticker on login page
- Fully responsive layout

### 🤖 Automation & Real-World Connectivity
- Python SOC agent for simulating and capturing real-world NGINX/Apache log ingestion
- Windows PowerShell agent for native Windows Event Log forwarding
- Auto-commit PowerShell script for continuous Git tracking

---

## 🚀 Getting Started

### Prerequisites
```
Node.js v18+  |  MongoDB Atlas account  |  Git
```

### Installation

```bash
# 1. Clone
git clone https://github.com/Het-2004/soc-siem-dashboard.git
cd soc-siem-dashboard

# 2. Backend
cd backend
npm install
cp .env.example .env        # Add MONGO_URI, JWT_SECRET, PORT
npm start

# 3. Frontend (new terminal)
cd ../frontend
npm install
npm run dev
```

Open **http://localhost:5173** and log in.

### Run the SOC Agent (Real-World Log Simulator)

```bash
# Python (cross-platform)
cd docs/agents
pip install requests
python soc_agent.py

# Windows PowerShell
powershell -ExecutionPolicy Bypass -File .\soc_agent_windows.ps1
```

### Environment Variables (`.env`)

```env
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/soc
JWT_SECRET=your_super_secret_key
PORT=5000
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 🌐 Real-World Use Cases & Data Flow

| Scenario | How This Platform Applies |
|---|---|
| **Data Gaining & Native Telemetry** | Deploy `soc_agent.py` or `.ps1` on remote target servers. They securely stream real access logs over HTTPS directly into the `/api/ingest` pipeline. |
| **Active Threat Detection** | The Express backend parses incoming real-time logs against threat signatures (e.g. SQLi, Brute-Force) and generates actionable Alerts. |
| **Insider Threat Tracking** | Audit logs permanently track all MERN platform user actions providing a zero-trust compliance trail. |
| **Incident Response** | SOC Analysts convert critical Alerts into Incidents, managing resolution lifecycle entirely within the Command Center UI. |

---

## 📅 Project Timeline & Phases

| Phase | Category | Focus |
|---|---|---|
| **Phase 1** | Foundation | Backend API, Auth, SIEM Core, WebSocket (Jan 2026) |
| **Phase 2** | Expansion | Frontend views, Audit Logs, Automation Tools (Feb 2026) |
| **Phase 3** | UI Redesign | Dark cyberpunk theme, Transitions, Threat map (Mar 2026) |
| **Phase 4** | Real-World Data | Cross-platform Agents, Log Enrichment, Cloud ingestion (Mar 2026) |
| **Phase 5** | Backend Polish | XSS Rules, Rate Limiting, Unit Tests (Mar-Apr 2026) |
| **Phase 6** | Frontend Polish | E2E Tests, Admin Configs, Responsive UI (Apr 2026) |
| **Phase 7** | CI/CD Deploy | GitHub Actions, Render API, Vercel UI, MongoDB Atlas (Apr 2026) |

> 📋 See [DEVELOPMENT_LOG.md](./DEVELOPMENT_LOG.md) for the full day-by-day work log.

---

## 📊 Current Status

| Component | Status |
|---|---|
| Backend Core SIEM API | ✅ Complete |
| Authentication & RBAC | ✅ Complete |
| Real-Time WebSockets | ✅ Complete |
| Control Center UI | ✅ Complete |
| Real-World Data Agents | 🔷 Planned — Mar 2026 |
| Notifications & Webhooks| 🔷 Planned — Mar 2026 |
| Automated E2E Tests | 🔷 Planned — Apr 2026 |
| Render/Vercel Deploy | 🔷 Planned — Apr 2026 |

---

## 👥 Project Information

| Field | Details |
|---|---|
| **Project Name** | SOC Command Center |
| **System Type** | SIEM Dashboard / Security Operations Center |
| **Stack** | MERN (MongoDB, Express, React, Node.js) |
| **Duration** | Jan 16 – Apr 24, 2026 (14 weeks) |
| **Developer** | Het Solanki |
| **GitHub** | [Het-2004/soc-siem-dashboard](https://github.com/Het-2004/soc-siem-dashboard) |

---

## 📄 License

MIT License — Free for academic and non-commercial use.