# 🎓 Master Presentation Guide: SOC Command Center

> **Purpose:** This file contains an in-depth, A-Z explanation of the SOC SIEM Dashboard. It is designed to prepare you for any deep technical questions a professor might ask during a final year viva. It covers the exact mechanics of the database, the backend algorithms, the frontend UI logic, and the security protocols.

---

## 💡 1. Core Concept & Problem Statement

**The Problem:**
Modern businesses rely on web servers, databases, and APIs. These systems generate thousands of logs per second indicating who logged in, what data was requested, and what failed. A hacker can perform a "Brute Force" attack (guessing a password 1,000 times) and it will simply look like lines of text in a massive log file. Human administrators cannot read logs fast enough to catch hackers in real time. 

**The Current Industry Solution:**
Companies buy **SIEM (Security Information and Event Management)** tools like Splunk, IBM QRadar, or Microsoft Sentinel. These are "Enterprise-Grade" and extremely expensive to license.

**Our Proposed Solution (This Project):**
We built a custom, cost-effective, Full-Stack SOC (Security Operations Center) Command Center using open-source MERN technologies. 
* **Collection:** It uses lightweight OS Agents to gather native server logs.
* **Detection:** It uses a high-speed Node.js algorithmic engine to instantly flag known hacker signatures (like SQL Injections).
* **Response:** It provides a real-time, zero-latency React Dashboard via WebSockets for analysts to visualize attacks on a world map and manage the incident lifecycle.

---

## 🏗️ 2. Detailed Technical Architecture (The Stack)

*Use this section if the professor asks: "Explain every technology you used and why you chose it."*

### A. The Database Tier: MongoDB Atlas
* **Why NoSQL?** Log data is unstructured and unpredictable. An Apache web server log looks completely different from a Windows Security log. Relational SQL databases (like MySQL) enforce strict, rigid tables. MongoDB stores data as flexible JSON/BSON documents, allowing us to ingest any type of log instantly without schema errors.
* **Schemas Used (Mongoose):**
  * **User Model:** Stores analyst details. Passwords are mathematically hashed with `bcrypt`.
  * **Log Model:** Stores the raw JSON payload arriving from the Edge Agents.
  * **Alert Model:** If a log triggers a threat rule, an Alert document is created storing the `severity` (LOW/MEDIUM/HIGH/CRITICAL) and the `rule_triggered`.
  * **Incident Model:** Tracks the human response (Status: OPEN, INVESTIGATING, RESOLVED) and analyst notes.
  * **AuditLog Model:** An immutable ledger tracking every API action taken by the logged-in SOC Analysts.

### B. The Logic Tier: Node.js & Express
* **Why Node.js?** A SIEM must ingest thousands of logs per second. Languages like PHP handle requests synchronously (blocking the thread). Node.js is **Asynchronous and Event-Driven** via the V8 Engine's Event Loop. It can handle massive concurrent I/O operations (writing logs to the database) without freezing.
* **Express.js API:** Provides the RESTful endpoints (e.g., `POST /api/ingest`, `GET /api/alerts`).
* **The Threat Engine Algorithm (`detector.js`):** 
  When the `/ingest` route receives a log, it runs it through our custom OWASP logic:
  1. *Signature Matching:* It checks the payload string for known hacking patterns. (e.g., If the URL contains `<script>`, it flags a Cross-Site Scripting (XSS) alert. If it contains `UNION SELECT`, it flags an SQL Injection alert).
  2. *Behavioral Thresholds:* It queries MongoDB to count recent actions. If an IP address has `action: "login_failed"` more than 10 times in the last 60 seconds, it triggers a "Brute Force" alert.

### C. The Communication Tier: Socket.IO (WebSockets)
* **The Polling Problem:** In standard web apps, the frontend has to repeatedly ask the backend "Are there new alerts?" every 2 seconds via an HTTP `GET` request. This causes massive server strain and bandwidth waste.
* **The WebSocket Solution:** `Socket.IO` upgrades the HTTP connection to a persistent TCP WebSocket. The connection stays open. The exact millisecond the Node.js Threat Engine generates a critical alert, it uses `socket.emit('new-alert')` to push the data directly into the React frontend. **Zero latency.**

### D. The Presentation Tier: React.js & Vite
* **Why React?** A Command Center has many moving parts (live statistic counters, live threat feeds, interactive charts). React's **Virtual DOM** allows us to update only the specific number or chart that changed, rather than reloading the entire HTML page. This makes the dashboard feel fluid and instantaneous.
* **State Management (Context API):** We use React's `AuthContext` to manage the user's JWT token globally across the application, ensuring private routes are protected.
* **Visualizations:**
  * **Leaflet.js:** An open-source mapping library. We plot incoming threat IP addresses on an Esri Dark Gray canvas, centered on our SOC HQ in Gujarat, animating attack vectors to visualize origin countries.
  * **Recharts:** Used for building the 7-day Alert Trend Area Chart and the Severity Pie Chart, complete with custom glowing gradients and frosted-glass tooltips.

### E. The Edge Tier: Native Collection Agents
* A dashboard is useless without real data. We built physical agent scripts that sit on target servers.
* **Python Agent (`soc_agent.py`):** Tail-reads Linux/Web server logs (like Nginx access logs), parses the lines into JSON, appending machine metadata, and securely sends them to our cloud API.
* **PowerShell Agent (`soc_agent_windows.ps1`):** Hooks into the native Windows Event Viewer API (`Get-WinEvent`), converting Windows Security Events (like failed RDP logins) into JSON payloads for our backend.

---

## 🔐 3. Platform Security (How we secure the SOC)

*If the professor asks: "How did you secure your own application so hackers don't break into the SOC?"*

1. **Authentication (JWT):** We do not use traditional cookies or server sessions. Upon login, the user receives a cryptographically signed JSON Web Token (JWT). The frontend must send this token in the `Authorization: Bearer` header of every request. If the token is tampered with or expired, the backend rejects the request immediately.
2. **Role-Based Access Control (RBAC):** We created a specific Express middleware that checks the JWT payload. An `ANALYST` can view alerts and update incidents. However, only an `ADMIN` can access user management routes or delete critical database records.
3. **Password Cryptography:** We use `bcryptjs` with a salt round of 10. Passwords are never stored in plain text. Even if a hacker dumps our MongoDB database, they only get irreversible mathematical hashes.
4. **Network Hardening:**
   * **Helmet.js:** Automatically strips vulnerable HTTP headers (e.g., hiding `X-Powered-By: Express`) and enforces strict MIME-type sniffing protections.
   * **CORS (Cross-Origin Resource Sharing):** The backend is strictly configured to only accept API requests from our specific Vite frontend domain and whitelisted Agent IPs.
   * **Rate Limiting:** We implement an IP-based rate limiter middleware on the `/api/login` and `/api/ingest` routes to prevent attackers from trying to DDoS our own SOC platform.
5. **Zero-Trust Auditing:** Every POST, PUT, and DELETE request made by an authenticated analyst is logged into an immutable **AuditLog** collection. This ensures total internal accountability.

---

## 💻 4. The Live Demo Script

*Step-by-step guide on what to click and say during your presentation.*

1. **The Login Screen:**
   > *"Sir, this is the main portal. Notice the live styling. I'm logging in via JWT authentication. Please watch the transition animation—it is a custom CSS sequence mimicking an enterprise security terminal."*
2. **The Main Dashboard:**
   > *"This is the Command Center. The KPI cards at the top show our live metrics. In the center is the Threat Map. We utilized Leaflet.js to plot incoming cyberattacks against our SOC HQ located here in Gujarat. Below, the Recharts visualize the severity of the attacks over a 7-day trend."*
3. **Demonstrating Live WebSockets (The "Wow" Moment):**
   > Keep the dashboard open. Open your laptop terminal and run the Python Agent (`python docs/agents/soc_agent.py`) to trigger a fake SQL Injection or Brute Force attack.
   > *"I am now running an external agent simulating a hacker attacking a web server. Watch the React dashboard."*
   > (A red toast alert will instantly pop up on the screen, and the charts will jump).
   > *"As you can see, the Node.js Threat Engine detected the payload and used Socket.IO to push the alert to the UI in milliseconds. No page refresh was required."*
4. **Incident Response Flow:**
   > Navigate to the **Incidents** page.
   > *"Detecting an alert is step one. Step two is response. An analyst takes that critical alert and creates an 'Incident'. I can change the status from 'OPEN' to 'INVESTIGATING', document my mitigation notes, and finally mark it as 'RESOLVED'."*
5. **Log Explorer & Accountability:**
   > Navigate to the **Logs** and then **Audit Logs** pages.
   > *"Finally, here is the raw terminal-style Log Explorer for deep threat hunting. And on the Audit Logs page, you can see that the system tracked the exact moment I just changed that incident status. We must monitor the monitors."*

---

## 🎯 5. Final Conclusion Summary

To conclude your presentation:

*"In summary, this project demonstrates a complete, end-to-end security pipeline. It ranges from low-level OS log collection via Agents, through high-speed algorithmic threat detection in Node.js, and culminates in a premium, real-time React visualization suite. It proves that powerful, real-time Enterprise SOC capabilities can be achieved efficiently using the modern MERN stack."*
