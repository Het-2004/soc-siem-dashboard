# Real-World Integration Guide

> Deploy this dashboard as a **live monitoring platform** for your company or home
> network. Anything with an IP address can send data to it.

---

## Architecture

```
Your Company Network / Home Lab
┌─────────────────────────────────────────────────────────────┐
│  Linux Server   →  soc_agent.py        ─────────────────┐  │
│  Windows PC     →  soc_agent_windows.ps1  ──────────────┤  │
│  Firewall       →  curl / REST POST       ──────────────┤  │
│  Custom App     →  HTTP POST /api/ingest  ──────────────┤  │
└──────────────────────────────────────────────────────────┼──┘
                                                           ▼
                                            SOC Dashboard Backend
                                            POST /api/ingest/alert
                                            POST /api/ingest/log
                                            POST /api/ingest/bulk
                                                           │
                                            Socket.IO ─────▶ Live Dashboard UI
```

---

## Step 1 — Set Your API Key

In `backend/.env`, change the default key to something strong:

```env
INGEST_API_KEY=your-very-long-random-secret-key-here
```

Restart the backend after editing `.env`.

---

## Step 2 — Firewall / Router Integration

Most enterprise firewalls (pfSense, OPNsense, Fortinet, Cisco ASA) can send
alerts via webhooks or syslog. Use **curl** as a syslog forwarder script:

```bash
# Push a single alert from any Linux shell / cron job
curl -X POST http://YOUR-SERVER:5000/api/ingest/alert \
  -H "X-API-Key: your-key-here"                       \
  -H "Content-Type: application/json"                  \
  -d '{"title":"Firewall block - Port Scan","severity":"HIGH","ipAddress":"192.168.1.50"}'
```

---

## Step 3 — Linux Server Agent

Run on any Linux machine with Python 3:

```bash
cd docs/agents
# Edit CONFIG block at the top of the file
nano soc_agent.py

# Run
python3 soc_agent.py

# Run as background service (systemd)
sudo nano /etc/systemd/system/soc-agent.service
```

**`soc-agent.service`:**
```ini
[Unit]
Description=SOC Dashboard Agent
After=network.target

[Service]
ExecStart=/usr/bin/python3 /opt/soc-agent/soc_agent.py
Restart=always
User=root

[Install]
WantedBy=multi-user.target
```

```bash
sudo systemctl enable --now soc-agent
```

---

## Step 4 — Windows Server Agent

Run PowerShell as **Administrator**:

```powershell
# Edit the $DashboardUrl and $ApiKey at the top first
notepad .\docs\agents\soc_agent_windows.ps1

# Run interactively
powershell -ExecutionPolicy Bypass -File .\docs\agents\soc_agent_windows.ps1

# Or register as a Windows Scheduled Task to run at startup
schtasks /create /tn "SOC-Agent" /tr "powershell -ExecutionPolicy Bypass -File C:\soc-agent\soc_agent_windows.ps1" /sc onstart /ru SYSTEM
```

---

## Step 5 — Bulk API (Batch from any language)

Send up to 100 alerts + 100 logs in a single HTTP call:

```python
import requests, json

requests.post(
    "http://YOUR-SERVER:5000/api/ingest/bulk",
    headers={"X-API-Key": "your-key", "Content-Type": "application/json"},
    json={
        "alerts": [
            {"title": "Brute force attempt", "severity": "HIGH", "ipAddress": "10.0.0.55"},
            {"title": "Port scan detected",  "severity": "MEDIUM", "ipAddress": "10.0.0.78"},
        ],
        "logs": [
            {"type": "NETWORK", "message": "Unusual outbound traffic on port 4444", "ipAddress": "10.0.0.20", "severity": "HIGH"},
        ]
    }
)
```

---

## API Reference

| Endpoint | Method | Auth | Description |
|----------|--------|------|-------------|
| `/api/ingest/health` | GET | None | Check if ingest is enabled |
| `/api/ingest/alert` | POST | X-API-Key | Push a single alert |
| `/api/ingest/log` | POST | X-API-Key | Push a single log entry |
| `/api/ingest/bulk` | POST | X-API-Key | Batch push up to 100 alerts + 100 logs |

### Alert fields
| Field | Required | Values |
|-------|----------|--------|
| `title` | ✅ | Any string |
| `ipAddress` | ✅ | IPv4 address |
| `severity` | ❌ | `HIGH` / `MEDIUM` / `LOW` (default: LOW) |
| `status` | ❌ | `OPEN` / `ACKNOWLEDGED` / `RESOLVED` (default: OPEN) |

### Log fields
| Field | Required | Values |
|-------|----------|--------|
| `message` | ✅ | Event description |
| `ipAddress` | ✅ | Source IP |
| `type` | ❌ | `AUTH` / `NETWORK` / `SECURITY` / `SYSTEM` etc. |
| `severity` | ❌ | `HIGH` / `MEDIUM` / `LOW` |
| `endpoint` | ❌ | Affected endpoint/URL |

---

## Making It Internet-Accessible (Production)

To use from outside your network:

1. **Use a domain + HTTPS** — set up Nginx/Caddy as a reverse proxy with Let's Encrypt SSL
2. **Set `CORS_ORIGIN`** in `.env` to your frontend domain (not `*`)
3. **Change all secrets** — `JWT_SECRET`, `INGEST_API_KEY`
4. **Use MongoDB Atlas** — replace `MONGO_URI` with your Atlas connection string
5. **Deploy on a VPS** — DigitalOcean, AWS, or a home server with port forwarding

```env
# Production .env example
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/soc_siem
JWT_SECRET=a-very-long-random-production-secret
INGEST_API_KEY=another-long-random-key
CORS_ORIGIN=https://yourdomain.com
NODE_ENV=production
```

---

## What Each Page Monitors in Real Use

| Page | Real-World Data |
|------|----------------|
| **Dashboard** | Live stats, threat map showing attack origins, security score |
| **Alerts** | Security events from firewalls, IDS, agents — filterable by severity |
| **Log Explorer** | Real-time terminal log stream — every event with timestamps |
| **Incidents** | Manually created from alerts — tracked investigation timeline |
| **Audit Logs** | Every API action with method (GET/POST/PUT/DELETE), role & IP |

---

## Tested Integration Sources

- ✅ pfSense / OPNsense (via webhook + curl script)
- ✅ Fail2ban (Python agent reads fail2ban.log)
- ✅ Linux SSH auth.log (Python agent)
- ✅ Windows Security Event Log (PowerShell agent)
- ✅ Any custom application (direct REST POST)
- ✅ Bash scripts / cron jobs (curl commands)
