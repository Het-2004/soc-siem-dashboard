# 🎓 Master Viva & Presentation Guide: SOC Command Center

> **Purpose:** This file translates the massive technical architecture from your `README.md` into an easy-to-read, conversational script. It is designed to prepare you for any deep technical questions a professor might ask during your final year viva. 

---

## 💡 1. The Core Problem & Our Unique Solution

**The Problem Your Professor Will Ask About:**
*"Why do we need a SOC Dashboard when we already have logs?"*
**Your Answer:**
Modern businesses generate thousands of logs per second across servers. A hacker jumping through a firewall and brute-forcing a database just looks like 50 lines of text in a massive sea of logs. Human administrators cannot physically read text logs fast enough to catch hackers in real time. 

**Our Proposed Solution:**
We built a custom, cost-effective, Full-Stack **SIEM** (Security Information and Event Management) platform using the MERN stack. 
* **Collection:** It uses lightweight OS Agents to gather native Windows Kernel logs.
* **Detection:** It uses a high-speed Node.js correlator to instantly flag repeated hacker attacks.
* **Response:** It provides a real-time, zero-latency React Dashboard via WebSockets for analysts to visualize attacks geographically.

---

## 🏗️ 2. Detailed Technical Architecture (The Stack)

*Use this explicitly if the professor asks: "Explain the architecture and why you chose these technologies."*

### A. The Ingestion Tier: PowerShell Native Telemetry
* **Why did you use PowerShell?** Instead of installing heavy third-party software, we execute `windows-event-agent.ps1` natively. It utilizes Windows' own `Get-WinEvent` API to listen for critical security faults (like Event ID 4625 for Failed Logins). 
* **The "Zero Fake Data" Rule:** Unlike basic academic projects, **this project generates NO fake data**. If an alert appears on the screen, it means the operating system genuinely detected an intrusion attempt.

### B. The Logic Tier: Node.js & Express API
* **Why Node.js?** A SIEM must ingest thousands of logs concurrently. Node.js uses an Asynchronous V8 Event Loop, allowing it to handle massive, non-blocking network streams securely.
* **The Automated Correlation Engine:** Our backend jobs (`autoIncident.js`) act like a robotic analyst. If an attacker tries to brute force the system and triggers 5 `HIGH` severity alerts from the same IP within 10 minutes, the Node daemon automatically aggregates them into a massive unified **Incident Ticket**.

### C. The Communication Tier: WebSockets (Socket.IO)
* **The "Polling" Problem:** Standard websites ask the server "Are there new alerts?" every 5 seconds. This is called HTTP polling and it causes massive strain and delays.
* **The WebSocket Solution:** We use TCP WebSockets to keep a persistent open pipe between the server and the UI. The exact millisecond the Node.js Threat Engine generates an alert, it uses `socket.emit('new-alert')` to push the data directly into the React frontend. **Zero latency.**

### D. The Storage Tier: MongoDB Atlas
* **Why NoSQL?** Log data is unstructured and unpredictable. Relational SQL databases are too rigid. MongoDB stores security data as flexible JSON documents, allowing us to ingest network payloads dynamically at high velocities.

### E. The Presentation Tier: React.js & Vite
* **Why React?** Our dashboard features live statistics, an interactive map, and moving tickers. React's **Virtual DOM** updates only the specific alert box that changed, meaning the entire webpage never has to reload, ensuring the security viewer is fluid.

---

## 🔐 3. Platform Security (How we secure the SOC)

*If the professor asks: "How is your application safe from attackers?"*

1. **Authentication (JWT & RBAC):** We use JSON Web Tokens instead of cookies. We also enforce strict Role-Based Access Control (RBAC). Only `ADMIN` users can view audit trails or manage users; `ANALYST` users can only view logs.
2. **Password Cryptography:** We use `bcryptjs` (salt round 10). If the database is breached, the hackers only see mathematical hashes, never plain text passwords.
3. **Network Hardening:** We utilize `Helmet.js` to strip vulnerable HTTP headers and `express-rate-limit` on our API endpoints so hackers cannot DDoS our ingest servers.
4. **Zero-Trust Auditing:** Every action a user takes on the dashboard (e.g., resolving an incident) is permanently recorded in the immutable **AuditLogs**, protecting against rogue internal analysts.

---

## 💻 4. The Live Demonstration Script

*Step-by-step guide on what to do and say during your live Viva running presentation.*

**Step 1: The Login Screen**
> *"Sir, I am logging into the Secure Portal via JWT authentication. Notice the custom CSS terminal-transition animation upon entry."*

**Step 2: The Command Center (Dashboard)**
> *"This is the central SIEM. Our KPI cards dynamically track threats. In the center is the Threat Map utilizing Leaflet.js to geolocate attacking IPs. Below are the Recharts visualizing 7-day severity distributions."*

**Step 3: Triggering a Real-World Attack (The "Wow" Moment)**
> *Make sure your Node backend, React Frontend, and `windows-event-agent.ps1` are all running.*
> *"Professor, to prove this system uses 100% genuine architecture with zero mock data, I will now simulate a Brute Force attack on this physical computer."*
> 1. Lock your Windows Computer (`Win + L`).
> 2. Type an incorrect password 5-6 times rapidly.
> 3. Unlock with the correct password.
> 4. Point to the dashboard.
> *"As you can see, the Node Server instantly intercepted the Windows OS `EventID 4625` faults, sent it over WebSockets, and flagged it red on our UI with zero latency. In addition, the Correlation Engine recognized I attacked 5 times in a row, and automatically opened a major Incident summarizing the attack vector."*

**Step 4: The Audit Trail**
> Navigate to the **Audit Logs**.
> *"Finally, here is the Audit Log. It proves security accountability by silently recording the fact that I just logged into the system 5 minutes ago."*

---

## 🎯 5. Conclusion For The Examiners

*"To conclude, this project bridges the gap between academic theory and enterprise reality. By combining raw Windows Kernel telemetry with the high-speed Node.js MERN stack, we built an architecture that successfully mimics industry-leading SIEMs like Splunk, offering real-time zero-trust intrusion detection at scale."*
