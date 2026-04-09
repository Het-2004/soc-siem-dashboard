<#
.SYNOPSIS
    Windows Security Event Log → SOC SIEM Dashboard Ingest Agent

.DESCRIPTION
    Polls the Windows Security Event Log for important security events
    (failed logins, logon attempts, privilege use, process creation)
    and forwards them to the SOC SIEM Dashboard ingest API in real-time.

    Monitored Event IDs:
      4625 — An account failed to log on
      4771 — Kerberos pre-authentication failed
      4648 — A logon was attempted using explicit credentials
      4688 — A new process was created
      4672 — Special privileges assigned to new logon
      4720 — A user account was created

.SETUP
    1. Edit the CONFIG section below with your settings.
    2. (Optional) Right-click → "Run with PowerShell as Administrator"
       to access Security event log (requires admin for 4625, 4771, etc.)
    3. Or schedule via Task Scheduler for continuous monitoring.

.EXAMPLE
    .\windows-event-agent.ps1
#>

# ── CONFIG ──────────────────────────────────────────────────────
$INGEST_URL  = "http://localhost:5000"            # Backend URL
$API_KEY     = "soc-ingest-key-change-me-in-production" # Match INGEST_API_KEY in .env
$POLL_SEC    = 30                                 # How often to poll (seconds)
$LOOKBACK_MIN = 5                                 # How far back to look on each poll
$MAX_EVENTS  = 20                                 # Max events per poll cycle
# ────────────────────────────────────────────────────────────────

# Severity mapping by Event ID
$SEVERITY_MAP = @{
    4625 = "HIGH"    # Failed logon
    4771 = "HIGH"    # Kerberos failures
    4648 = "MEDIUM"  # Explicit credential logon
    4688 = "LOW"     # New process
    4672 = "HIGH"    # Special privileges
    4720 = "HIGH"    # User account created
}

# Friendly title mapping
$TITLE_MAP = @{
    4625 = "Failed Logon Attempt"
    4771 = "Kerberos Pre-Authentication Failed"
    4648 = "Explicit Credential Logon"
    4688 = "New Process Created"
    4672 = "Special Privileges Assigned"
    4720 = "User Account Created"
}

$WATCHED_IDS = $SEVERITY_MAP.Keys

Write-Host ""
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  SOC SIEM — Windows Event Agent" -ForegroundColor Cyan
Write-Host "===========================================================" -ForegroundColor Cyan
Write-Host "  Server   : $INGEST_URL" -ForegroundColor Gray
Write-Host "  Polling  : every $POLL_SEC seconds" -ForegroundColor Gray
Write-Host "  Watching : Event IDs $($WATCHED_IDS -join ', ')" -ForegroundColor Gray
Write-Host ""

# Verify connectivity
try {
    $health = Invoke-RestMethod -Uri "$INGEST_URL/api/ingest/health" -Method GET -TimeoutSec 5
    Write-Host "  ✅ Connected to SOC dashboard (ingest: $($health.ingest))" -ForegroundColor Green
} catch {
    Write-Host "  ❌ Cannot reach $INGEST_URL — is the backend running?" -ForegroundColor Red
    exit 1
}
Write-Host ""

function Get-LocalIP {
    try {
        $ip = (Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.InterfaceAlias -notlike "*Loopback*" } | Select-Object -First 1).IPAddress
        return if ($ip) { $ip } else { "127.0.0.1" }
    } catch { return "127.0.0.1" }
}

$HOST_IP = Get-LocalIP
$lastRun = (Get-Date).AddMinutes(-$LOOKBACK_MIN)

while ($true) {
    $now = Get-Date
    Write-Host "[$now] Polling Security Event Log..." -ForegroundColor DarkCyan

    $alerts = @()
    $logs   = @()

    foreach ($id in $WATCHED_IDS) {
        try {
            $events = Get-WinEvent -FilterHashtable @{
                LogName   = "Security"
                Id        = $id
                StartTime = $lastRun
            } -MaxEvents $MAX_EVENTS -ErrorAction SilentlyContinue

            foreach ($ev in $events) {
                # Try to extract source IP from event message
                $srcIP = $HOST_IP
                if ($ev.Message -match '(\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})') {
                    $candidate = $Matches[1]
                    if ($candidate -ne "0.0.0.0" -and $candidate -ne "127.0.0.1") {
                        $srcIP = $candidate
                    }
                }

                $severity = $SEVERITY_MAP[$id]
                $title    = "$($TITLE_MAP[$id]) (EventID: $id)"

                $alerts += @{
                    title     = $title
                    severity  = $severity
                    ipAddress = $srcIP
                    status    = "OPEN"
                }

                $logs += @{
                    type      = "AUTH"
                    message   = $ev.Message.Substring(0, [Math]::Min(500, $ev.Message.Length))
                    ipAddress = $srcIP
                    severity  = $severity
                    endpoint  = "windows-event-agent"
                }
            }

            if ($events.Count -gt 0) {
                Write-Host "  Found $($events.Count) EventID $id events" -ForegroundColor Yellow
            }
        } catch {
            # Access denied → run as Administrator for Security log
            Write-Host "  ⚠  Cannot read EventID $id — try running as Administrator" -ForegroundColor DarkYellow
        }
    }

    # POST to bulk ingest
    if ($alerts.Count -gt 0 -or $logs.Count -gt 0) {
        try {
            $body = @{ alerts = $alerts; logs = $logs } | ConvertTo-Json -Depth 5

            $response = Invoke-RestMethod `
                -Uri     "$INGEST_URL/api/ingest/bulk" `
                -Method  POST `
                -Headers @{ "X-API-Key" = $API_KEY; "Content-Type" = "application/json" } `
                -Body    $body `
                -TimeoutSec 10

            Write-Host "  ✅ Sent: $($response.alertsInserted) alerts, $($response.logsInserted) logs" -ForegroundColor Green
        } catch {
            Write-Host "  ❌ Ingest failed: $($_.Exception.Message)" -ForegroundColor Red
        }
    } else {
        Write-Host "  — No new events this cycle" -ForegroundColor DarkGray
    }

    $lastRun = $now
    Start-Sleep -Seconds $POLL_SEC
}
