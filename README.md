<!-- # SOC / SIEM Dashboard using MERN
A cybersecurity monitoring system with logging, threat detection, alerts, and incident management. -->
# 🔐 Security Operations Center (SOC) / SIEM Dashboard using MERN

A full-stack cybersecurity project that implements centralized logging, real-time threat detection, alerting, and incident management using the MERN stack.  
This project is developed incrementally from **16 January 2026 to 29 January 2026** as part of the final year project.

---

## 📌 Project Overview

The SOC / SIEM Dashboard is designed to monitor application and security logs, detect suspicious activities, generate alerts, and manage incidents in real time.  
It is inspired by enterprise SOC tools like Splunk and Elastic SIEM and follows **OWASP** and **NIST** security principles.

---

## 🧰 Tech Stack

- **Frontend**: React
- **Backend**: Node.js, Express.js
- **Database**: MongoDB
- **Authentication**: JWT, bcrypt
- **Real-Time**: Socket.IO
- **Security**: RBAC, Rate Limiting, Centralized Logging

---

## 📅 Date-Wise Development Timeline

### 📅 16 January 2026 – Project Initialization & Planning
- Finalized project topic: SOC / SIEM Dashboard
- Studied real-world SOC and SIEM systems
- Defined problem statement and objectives
- Designed high-level system architecture
- Created initial documentation and repository structure

---

### 📅 19 January 2026 – Backend Setup
- Initialized Node.js and Express server
- Configured MongoDB database connection
- Added environment configuration using `.env`
- Implemented basic security middleware (CORS, rate limiting)
- Verified backend server health

---

### 📅 20 January 2026 – Authentication
- Designed User schema
- Implemented user login and registration APIs
- Added password hashing using bcrypt
- Implemented JWT-based authentication
- Tested authentication APIs using Postman

---

### 📅 21 January 2026 – Authorization (RBAC)
- Implemented Role-Based Access Control (RBAC)
- Defined roles: ADMIN and ANALYST
- Protected APIs using authentication and authorization middleware
- Ensured unauthorized access is blocked

---

### 📅 22 January 2026 – Log Ingestion (SIEM Core)
- Designed Log schema
- Implemented centralized log ingestion system
- Captured login logs, API access logs, and system logs
- Stored logs securely in MongoDB
- Enabled time-based log querying

---

### 📅 23 January 2026 – Threat Detection & Alerts
- Implemented rule-based threat detection engine
- Added brute-force login detection logic
- Added API abuse detection logic
- Designed Alert schema with severity levels
- Generated alerts automatically based on detection rules

---

### 📅 27 January 2026 – Incident Management & Dashboard
- Converted alerts into security incidents
- Implemented Incident Management System
- Added incident lifecycle (OPEN, INVESTIGATING, RESOLVED)
- Built React frontend pages:
  - Dashboard
  - Alerts
  - Logs
  - Incidents
- Connected frontend with backend APIs

---

### 📅 28 January 2026 – Real-Time Alerts & Documentation
- Integrated Socket.IO for real-time alert notifications
- Displayed live alert popups on dashboard
- Performed attack simulations and testing
- Verified end-to-end SOC workflow
- Prepared final project report PDF and presentation slides

---

### 📅 29 January 2026 – UI Enhancement & Final Testing
- Improved SOC dashboard UI and navigation
- Added navbar and better page structure
- Displayed alert severity summary on dashboard
- Performed final testing and bug fixing
- Updated documentation and prepared project for submission

---

## Final Status
- SOC / SIEM Dashboard completed
- Real-time alerts implemented
- Incident management workflow verified
- Project tested and ready for submission

---