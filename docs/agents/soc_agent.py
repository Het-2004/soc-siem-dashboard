"""
SOC Dashboard — Python Agent
Reads local syslog/auth.log and pushes events to the dashboard in real-time.

Requirements:
    pip install requests

Usage:
    python3 soc_agent.py

Customise the CONFIG block below for your environment.
"""

import time
import re
import json
import requests
import os

# ─────────────────────────────────────────
# CONFIG — edit these to match your setup
# ─────────────────────────────────────────
DASHBOARD_URL = "http://localhost:5000"     # or your server IP/domain
API_KEY       = "soc-ingest-key-change-me-in-production"
LOG_FILES     = [
    "/var/log/auth.log",     # Linux SSH / sudo events
    "/var/log/syslog",       # General system events
    "/var/log/fail2ban.log", # Fail2ban blocked IPs
]
POLL_INTERVAL = 5  # seconds between polls

HEADERS = {
    "X-API-Key":    API_KEY,
    "Content-Type": "application/json",
}

# ─────────────────────────────────────────
# PATTERNS — map log lines to severity
# ─────────────────────────────────────────
PATTERNS = [
    # SSH brute-force / failures
    (re.compile(r"Failed password.+from (\S+)"),            "HIGH",   "AUTH",     "SSH Failed Password"),
    (re.compile(r"Invalid user .+ from (\S+)"),             "HIGH",   "AUTH",     "Invalid SSH User"),
    # SSH success
    (re.compile(r"Accepted (?:password|publickey).+from (\S+)"), "LOW", "AUTH",   "SSH Login Success"),
    # Sudo
    (re.compile(r"sudo:.+COMMAND=.+;.+from (\S+)", re.I),   "MEDIUM", "SYSTEM",  "Sudo Command"),
    # Fail2ban
    (re.compile(r"Ban (\S+)"),                              "HIGH",   "SECURITY", "IP Banned by Fail2ban"),
    # Generic
    (re.compile(r"error.+from (\S+)", re.I),                "MEDIUM", "SYSTEM",  "System Error"),
]

def parse_ip(line):
    """Extract an IPv4 address from a log line."""
    m = re.search(r"\b(\d{1,3}(?:\.\d{1,3}){3})\b", line)
    return m.group(1) if m else "0.0.0.0"

def classify(line):
    """Return (severity, type, title, ip) or None if line is uninteresting."""
    for pattern, severity, log_type, title in PATTERNS:
        m = pattern.search(line)
        if m:
            ip = m.group(1) if m.lastindex else parse_ip(line)
            return severity, log_type, title, ip
    return None

def send_event(severity, log_type, title, ip, message):
    """Push a single alert + log to the dashboard."""
    try:
        # Push log entry
        requests.post(
            f"{DASHBOARD_URL}/api/ingest/log",
            headers=HEADERS,
            json={"type": log_type, "message": message, "ipAddress": ip, "severity": severity},
            timeout=5
        )
        # Push alert if HIGH or MEDIUM
        if severity in ("HIGH", "MEDIUM"):
            requests.post(
                f"{DASHBOARD_URL}/api/ingest/alert",
                headers=HEADERS,
                json={"title": title, "severity": severity, "ipAddress": ip},
                timeout=5
            )
    except requests.RequestException as e:
        print(f"[AGENT] Send failed: {e}")

def tail_file(path, state):
    """Yield new lines added to a file since last check."""
    try:
        if not os.path.exists(path):
            return
        size = os.path.getsize(path)
        last = state.get(path, size)       # start from end on first run
        if size < last:
            last = 0                        # file rotated
        if size == last:
            return
        with open(path, "r", errors="ignore") as f:
            f.seek(last)
            for line in f:
                yield line.strip()
        state[path] = size
    except PermissionError:
        print(f"[AGENT] No permission to read {path}. Run as root or with sudo.")

def main():
    print(f"[AGENT] SOC Dashboard agent started → {DASHBOARD_URL}")
    state = {}
    while True:
        for log_file in LOG_FILES:
            for line in tail_file(log_file, state):
                result = classify(line)
                if result:
                    severity, log_type, title, ip = result
                    print(f"[{severity}] {title} from {ip}")
                    send_event(severity, log_type, title, ip, line[:500])
        time.sleep(POLL_INTERVAL)

if __name__ == "__main__":
    main()
