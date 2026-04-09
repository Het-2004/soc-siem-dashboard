# SOC Dashboard — Windows PowerShell Agent
# Reads Windows Security Event Log and pushes HIGH/MEDIUM events to the dashboard.
#
# Run as Administrator for full Event Log access:
#   powershell -ExecutionPolicy Bypass -File .\soc_agent_windows.ps1
#
# ─────────────────────────────────────────
param(
    [string]$DashboardUrl = "http://localhost:5000",
    [string]$ApiKey = "soc-ingest-key-change-me-in-production",
    [int]   $PollInterval = 10   # seconds
)

$Headers = @{
    "X-API-Key"    = $ApiKey
    "Content-Type" = "application/json"
}

# Event IDs to monitor (Windows Security Log)
$EventMap = @{
    4625 = @{ Severity = "HIGH"; Title = "Failed Logon Attempt" }  # Failed logon
    4648 = @{ Severity = "MEDIUM"; Title = "Explicit Credential Logon" }  # Explicit credentials
    4720 = @{ Severity = "HIGH"; Title = "User Account Created" }  # Account created
    4726 = @{ Severity = "HIGH"; Title = "User Account Deleted" }  # Account deleted
    4740 = @{ Severity = "HIGH"; Title = "Account Locked Out" }  # Lockout
    4756 = @{ Severity = "MEDIUM"; Title = "Member Added to Group" }  # Group change
    4672 = @{ Severity = "MEDIUM"; Title = "Special Privileges Logon" }  # Admin logon
    1102 = @{ Severity = "HIGH"; Title = "Audit Log Cleared" }  # Log cleared (!)
}

function Send-ToSOC($body) {
    try {
        Invoke-RestMethod -Uri "$DashboardUrl/api/ingest/alert" `
            -Method Post `
            -Headers $Headers `
            -Body ($body | ConvertTo-Json) `
            -TimeoutSec 5 | Out-Null
    }
    catch {
        Write-Warning "[AGENT] Failed to send: $_"
    }
}

function Get-ClientIP($event) {
    try {
        $ip = $event.Properties | Where-Object { $_.Value -match '^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$' } | Select-Object -First 1
        return if ($ip) { $ip.Value } else { "127.0.0.1" }
    }
    catch { return "127.0.0.1" }
}

Write-Host "[SOC Agent] Monitoring Windows Security Event Log → $DashboardUrl" -ForegroundColor Cyan

$lastCheck = (Get-Date).AddSeconds(-$PollInterval)

while ($true) {
    $now = Get-Date
    try {
        $events = Get-WinEvent -FilterHashtable @{
            LogName   = "Security"
            Id        = ($EventMap.Keys)
            StartTime = $lastCheck
            EndTime   = $now
        } -ErrorAction SilentlyContinue

        foreach ($evt in $events) {
            $meta = $EventMap[$evt.Id]
            if (-not $meta) { continue }

            $ip = Get-ClientIP $evt
            Write-Host "[$($meta.Severity)] $($meta.Title) · EventId=$($evt.Id) · IP=$ip" -ForegroundColor Yellow

            Send-ToSOC @{
                title     = $meta.Title
                severity  = $meta.Severity
                ipAddress = $ip
                status    = "OPEN"
            }
        }
    }
    catch {
        Write-Warning "[AGENT] Event log read error: $_"
    }

    $lastCheck = $now
    Start-Sleep -Seconds $PollInterval
}
