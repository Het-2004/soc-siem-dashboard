# Agent Scripts — Real-World Data Ingestion

These scripts connect real security systems to your SOC SIEM dashboard via the `/api/ingest` endpoint. No code changes are needed — just configure the `$INGEST_URL` and `$API_KEY` at the top of each script.

---

## Quick Setup (Both Scripts)

1. Make sure the backend is running: `npm run dev` from `backend/`
2. Set `INGEST_API_KEY` in `backend/.env`
3. Use the **same key** in the scripts below

---

## 🪟 Windows Event Agent (`windows-event-agent.ps1`)

Monitors the Windows **Security Event Log** and sends events to your dashboard.

**Monitored Events:**
| EventID | Event | Severity |
|---|---|---|
| 4625 | Failed logon attempt | 🔴 HIGH |
| 4672 | Special privileges assigned | 🔴 HIGH |
| 4720 | User account created | 🔴 HIGH |
| 4648 | Explicit credential logon | 🟡 MEDIUM |
| 4688 | New process created | 🟢 LOW |

**Run (PowerShell as Administrator):**
```powershell
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
.\windows-event-agent.ps1
```

> **Admin required** for Security event log access (EventID 4625, 4672, etc.)

**Run in background:**
```powershell
Start-Job -FilePath .\windows-event-agent.ps1
```

---

## 🐧 Linux Auth Agent (`linux-auth-agent.sh`)

Monitors `/var/log/auth.log` in real-time for SSH/sudo events.

**Monitored Events:**
| Pattern | Event | Severity |
|---|---|---|
| `Failed password` | SSH brute force attempt | 🔴 HIGH |
| `Invalid user` | Unknown user login | 🔴 HIGH |
| `Accepted password` | Successful SSH login | 🟢 LOW |
| `sudo.*command` | Privilege escalation | 🟡 MEDIUM |

**Run:**
```bash
chmod +x linux-auth-agent.sh
sudo ./linux-auth-agent.sh
```

**Run in background:**
```bash
sudo nohup ./linux-auth-agent.sh > /var/log/siem-agent.log 2>&1 &
```

**View background logs:**
```bash
tail -f /var/log/siem-agent.log
```

---

## 🧪 Testing the Ingest API Manually

```bash
# Health check
curl http://localhost:5000/api/ingest/health

# Push a single alert (replace key)
curl -X POST http://localhost:5000/api/ingest/alert \
  -H "Content-Type: application/json" \
  -H "X-API-Key: soc-ingest-key-change-me-in-production" \
  -d '{"title":"Test SSH Attack","severity":"HIGH","ipAddress":"8.8.8.8"}'

# PowerShell equivalent
Invoke-RestMethod -Uri "http://localhost:5000/api/ingest/alert" `
  -Method POST `
  -Headers @{"X-API-Key"="soc-ingest-key-change-me-in-production";"Content-Type"="application/json"} `
  -Body '{"title":"Test Alert","severity":"HIGH","ipAddress":"8.8.8.8"}'
```
