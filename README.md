# 🔐 SOC Command Center: Real-World SIEM Platform
### Master Documentation & Analytical Overview

> A professional-grade, 100% real-world **Security Information & Event Management (SIEM)** and **Security Operations Center (SOC)** platform. This platform monitors living systems and actively detects incoming intrusions natively without relying on fake data or mock data.

**Final Year Project | Computer Engineering | 2025–2026 | Developer: Het Solanki**

---

## 📌 Project Overview & Analytical Perspective

The **SOC Command Center** acts as the central nervous system for your digital security. From an analytical perspective, it serves three main purposes:
1. **Endpoint Visibility**: Extracting raw Windows Security logic (`EventID 4625` and others) natively.
2. **Real-Time Delivery**: Instantly beaming threats from agents to analysts via WebSockets.
3. **Automated Triage**: Removing alert-fatigue from analysts by actively measuring attack velocities (e.g., 5 failed logins in 10 minutes) and auto-escalating them into unified Incident tickets.

We engineered this system to comply with the **NIST Cybersecurity Framework** (Protect → Detect → Respond) and completely purged any "Dummy" or "Mock" data out of the source code. **If you see a threat on this dashboard, it is a real threat against the server.**

---

## 🏗️ Architecture & Data Flow

1. **The Target (Windows Host)**: We execute the `windows-event-agent.ps1` in PowerShell. This acts as an invisible background watchdog polling the deep OS Event Viewer every 30 seconds.
2. **The Pipeline (Backend API)**: The watchdog pushes raw JSON containing IPs, severity, and Event IDs to your `/api/ingest/bulk` Express endpoint.
3. **The Correlation Engine (Backend Logic)**: While the API saves data to MongoDB, the `autoIncident.js` chron-job actively monitors the velocity of attacks from any single IP to determine if an intrusion is automated (Brute-Force).
4. **The Command Center (Frontend Viewer)**: Using `Socket.io`, analysts viewing the Vite+React dashboard see the UI pulse with live `HIGH` severity alerts in less than a second of an attack occurring.

---

## 🧰 Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend UI/UX** | React 18, Vite, Recharts, Cyberpunk CSS Variables, Glassmorphism |
| **Backend Core** | Node.js, Express.js, Mongoose, Socket.IO |
| **Database** | MongoDB Atlas (NoSQL Document Store) |
| **Authentication** | JWT (JSON Web Tokens), bcrypt hashing, Role-Based Access Control |
| **Log Agents** | Windows native `PowerShell` scripts |

---

## 🚀 How to Start the System

Running this project requires activating the triad: The API, The Dashboard, and The Watchdog.

### Step 1: Start the Backend Brain
```bash
# Terminal 1
cd backend
npm install
npm run dev
```
*(Your server starts on port 5000 and connects to MongoDB).*

### Step 2: Start the UI
```bash
# Terminal 2
cd frontend
npm install
npm run dev
```
*(Available at `http://localhost:5173`. Login using your Admin or Analyst credentials).*

### Step 3: Start the Security Watchdog (The Agent)
**Requires Administrator privileges to read Windows Core Security.**
```powershell
# Terminal 3 (Run PowerShell as Administrator)
cd "scripts"
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\windows-event-agent.ps1
```
*(This agent will now quietly monitor your Windows system and stream threats to `localhost:5000`).*

---

## 🧪 How to Work & Test the System

Since there is **0% fake data**, to test the platform you must generate a real security event. 

### The Intrusion Test
1. Make sure all three systems are running (Backend, Frontend, Agent).
2. Lock your physical computer screen (`Windows Key + L`).
3. Intentionally attempt to log in with an incorrect password.
4. Unlock with the correct password.
5. **View Dashboard**: You will immediately see a `HIGH` priority alert titled *"Failed Logon Attempt (EventID: 4625)"*.

### The Auto-Incident Engine Test
1. Lock your screen again.
2. Type a wrong password **6 times repeatedly** to mimic an automated script or hacker brute-forcing your machine.
3. **View Dashboard**: Your backend correlation engine intercepts this. Instead of overwhelming the analyst, it automatically groups these alerts and generates a massive Red Incident: `[AUTO] Repeated HIGH Alerts from Localhost`, complete with timeline analytics.

---

## 📁 System Administration

### Pristine Database Wipe
Need to wipe previous alerts but keep your user accounts? We built a utility function precisely for this:
```bash
cd backend
node clear-db.js
```
*This permanently clears Alerts, Logs, Incidents, and Audit Logs, letting you reset your Security Lab completely without losing your login credentials.*

---

## ✅ Current Project Status

Everything in this ecosystem is natively functioning. 

| Phase | Component | Status |
|---|---|---|
| 1 | Backend Core SIEM API & Routing | ✅ Complete |
| 2 | Advanced MERN Authentication & RBAC | ✅ Complete |
| 3 | Real-Time Live WebSockets | ✅ Complete |
| 4 | Premium UI with Geo-Map & Dark Glass Theme | ✅ Complete |
| 5 | **Real-World PowerShell Data Agents** | ✅ Complete |
| 6 | Automated Intrusion Detection (Auto-Incidents) | ✅ Complete |
| 7 | Mock Data Purged (100% Reality Driven) | ✅ Complete |

---

## 📄 Repository Rules
- Keep the `seed.js` script deleted to ensure no mock data infiltrates the metrics tracking.
- Do not commit `.env` containing your MongoDB URI or Secret Keys.

*MIT License — End of Master Readme File.*