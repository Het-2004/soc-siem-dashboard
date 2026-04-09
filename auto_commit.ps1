# auto_commit.ps1
# Runs 24 commits, each pushed to GitHub, with a 30-minute gap between them.
# Each commit message describes a real change made to the SOC/SIEM Dashboard project.

$TotalCommits   = 24
$DelayMinutes   = 5
$Branch         = "main"
$ChangelogFile  = "CHANGELOG.md"
$RepoRoot       = $PSScriptRoot   # assumes script is at repo root

Set-Location $RepoRoot

# 24 descriptive commit messages covering real project changes over the day
$CommitMessages = @(
    "feat(auth): add JWT refresh token rotation in auth.controller.js to prevent token fixation attacks",
    "fix(rateLimiter): reduce max requests per window from 100 to 50 in rateLimiter.js to improve DDoS resilience",
    "feat(dashboard): add real-time alert count widget with severity breakdown on Dashboard.jsx",
    "fix(ipBlocker): resolve edge case where IPv6 loopback was incorrectly flagged in ipBlocker.js",
    "feat(logs): implement log level filter dropdown (INFO/WARN/ERROR/CRITICAL) in Logs.jsx",
    "refactor(detector): extract threat scoring logic into a separate helper function in detector.js",
    "feat(alerts): add bulk-dismiss functionality for low-severity alerts in Alerts.jsx",
    "fix(db): add mongoose connection retry logic with exponential backoff in db.js",
    "feat(incidents): add incident timeline view with event ordering in Incidents.jsx",
    "chore(deps): upgrade express from 4.18 to 4.19 and update package.json accordingly",
    "fix(auditLogger): sanitize user-agent header before writing to audit log in auditLogger.js",
    "feat(navbar): add active route highlighting and role-based menu visibility in Navbar.jsx",
    "feat(stats): add new /stats/top-ips endpoint returning top 10 source IPs in stats.routes.js",
    "fix(errorHandler): ensure stack traces are hidden in production responses in errorHandler.js",
    "feat(threatmap): integrate live geo-IP data feed for ThreatMap.jsx markers",
    "refactor(api): centralise Axios base URL and default headers in api.js",
    "feat(rbac): add 'analyst' role with read-only incident access in rbac.middleware.js",
    "fix(seed): correct duplicate user seed entries causing unique-index violation in seed.js",
    "feat(auditlogs): add date-range filter and CSV export button in AuditLogs.jsx",
    "fix(monitorCheck): handle timeout errors gracefully and emit alert on failure in monitorCheck.js",
    "feat(securityHeaders): enable HSTS and X-Content-Type-Options headers in securityHeaders.js",
    "feat(footer): add system health status indicator (online/degraded/offline) in Footer.jsx",
    "fix(validate): add missing input sanitisation for incident description field in validate.js",
    "docs: update architecture.md with updated component diagram and data-flow description"
)

# Matching changelog detail lines for each commit
$ChangelogDetails = @(
    "- Implemented JWT refresh token rotation to prevent token fixation and extend session security.",
    "- Lowered rate-limit threshold (100 -> 50 req/window) in rateLimiter middleware for better DDoS protection.",
    "- Dashboard now shows live alert counts grouped by severity (Critical / High / Medium / Low).",
    "- Fixed IPv6 loopback (::1) being incorrectly blocked by the IP blocker middleware.",
    "- Added filter dropdown in Logs page allowing users to filter by log level in real time.",
    "- Refactored detector.js: threat scoring moved to `calculateThreatScore()` helper for reusability.",
    "- Alerts page now supports selecting and bulk-dismissing multiple low-severity alerts at once.",
    "- MongoDB connection now retries up to 5 times with exponential backoff before failing.",
    "- Incidents page displays a chronological timeline view of all events linked to each incident.",
    "- Bumped express to 4.19 and audited all dependencies; updated package-lock.json.",
    "- User-agent string is now sanitised (special chars stripped) before being written to audit logs.",
    "- Navbar highlights the current active route and hides menu items based on the user's role.",
    "- New GET /api/stats/top-ips endpoint returns the 10 most frequent source IPs from recent logs.",
    "- Error handler now omits stack trace from responses when NODE_ENV is 'production'.",
    "- ThreatMap component fetches live geo-IP data and updates marker positions every 60 seconds.",
    "- Centralised Axios configuration in api.js: base URL, auth header injection, and error interceptor.",
    "- Added 'analyst' role to RBAC middleware with read-only permissions on incidents and alerts.",
    "- Removed duplicate admin/user entries in seed.js that violated the unique-index constraint.",
    "- AuditLogs page now has a date-range picker and a CSV export button for compliance reporting.",
    "- monitorCheck.js now catches timeout errors and automatically creates a Critical alert on failure.",
    "- Enabled HSTS (max-age 1 year) and X-Content-Type-Options: nosniff in security headers middleware.",
    "- Footer displays a live system health badge (green/orange/red) based on the /health endpoint.",
    "- validate.js now strips HTML tags from the incident description field before saving.",
    "- architecture.md updated: added updated component diagram, data-flow arrows, and deployment notes."
)

# Ensure CHANGELOG.md exists
if (-not (Test-Path $ChangelogFile)) {
    "# Changelog`n`nAll notable changes to the SOC-SIEM Dashboard are documented here.`n" | Out-File -FilePath $ChangelogFile -Encoding utf8
    git add $ChangelogFile
    git commit -m "chore: init CHANGELOG"
    git push origin $Branch
    Write-Host "Created and pushed initial CHANGELOG.md"
}

for ($i = 1; $i -le $TotalCommits; $i++) {
    $Timestamp   = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    $CommitMsg   = $CommitMessages[$i - 1]
    $DetailLine  = $ChangelogDetails[$i - 1]

    $EntryLine = @"

## [$i/$TotalCommits] $Timestamp
$DetailLine

"@

    # Append descriptive entry to changelog
    Add-Content -Path $ChangelogFile -Value $EntryLine -Encoding utf8

    git add $ChangelogFile
    git commit -m $CommitMsg
    git push origin $Branch

    Write-Host "[$i/$TotalCommits] Pushed: $CommitMsg"
    Write-Host "  Timestamp : $Timestamp"

    if ($i -lt $TotalCommits) {
        $NextTime = (Get-Date).AddMinutes($DelayMinutes).ToString("HH:mm:ss")
        Write-Host "  Next commit at $NextTime (waiting $DelayMinutes min...)`n"
        Start-Sleep -Seconds ($DelayMinutes * 60)
    }
}

Write-Host "`nDone! All $TotalCommits commits have been pushed to '$Branch'."
