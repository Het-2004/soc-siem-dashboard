#!/bin/bash
# ==============================================================
#  linux-auth-agent.sh — Linux Auth Log → SOC SIEM Dashboard
# ==============================================================
#
#  Tails /var/log/auth.log (or /var/log/secure on RHEL/CentOS)
#  in real-time, parses failed SSH logins, and POSTs each event
#  to the SOC SIEM ingest API.
#
#  SETUP:
#    1. Edit CONFIG section below
#    2. chmod +x linux-auth-agent.sh
#    3. sudo ./linux-auth-agent.sh
#       (sudo needed to read /var/log/auth.log)
#
#  To run in background:
#    sudo nohup ./linux-auth-agent.sh > /var/log/siem-agent.log 2>&1 &
#
# ==============================================================

# ── CONFIG ─────────────────────────────────────────────────────
INGEST_URL="http://localhost:5000"
API_KEY="soc-ingest-key-change-me-in-production"
LOG_FILE="/var/log/auth.log"   # RHEL/CentOS: /var/log/secure
# ───────────────────────────────────────────────────────────────

# Detect log file
if [ ! -f "$LOG_FILE" ]; then
  if [ -f "/var/log/secure" ]; then
    LOG_FILE="/var/log/secure"
  else
    echo "❌ Cannot find auth log at $LOG_FILE or /var/log/secure"
    exit 1
  fi
fi

# Check jq is available (for JSON)
if ! command -v jq &> /dev/null; then
  echo "⚠  'jq' not found. Installing..."
  apt-get install -y jq 2>/dev/null || yum install -y jq 2>/dev/null || {
    echo "❌ Please install jq manually: https://stedolan.github.io/jq/download/"
    exit 1
  }
fi

# Verify connectivity
echo ""
echo "==========================================================="
echo "  SOC SIEM — Linux Auth Log Agent"
echo "==========================================================="
echo "  Server  : $INGEST_URL"
echo "  Watching: $LOG_FILE"
echo ""

HEALTH=$(curl -sf "$INGEST_URL/api/ingest/health" 2>/dev/null)
if [ $? -ne 0 ]; then
  echo "❌ Cannot reach $INGEST_URL — is the backend running?"
  exit 1
fi
echo "✅ Connected to SOC dashboard"
echo ""

# Get local machine IP
LOCAL_IP=$(hostname -I 2>/dev/null | awk '{print $1}')
[ -z "$LOCAL_IP" ] && LOCAL_IP="127.0.0.1"

echo "📡 Monitoring $LOG_FILE for security events..."
echo ""

# Tail the log file and parse in real-time
tail -F "$LOG_FILE" | while read -r LINE; do

  # ── Failed SSH password attempt ─────────────────────────────
  if echo "$LINE" | grep -qE "Failed password|authentication failure|Invalid user"; then
    IP=$(echo "$LINE" | grep -oP '(\d{1,3}\.){3}\d{1,3}' | head -1)
    [ -z "$IP" ] && IP="$LOCAL_IP"
    USER=$(echo "$LINE" | grep -oP '(?<=invalid user |for )(\S+)' | head -1)
    [ -z "$USER" ] && USER="unknown"

    PAYLOAD=$(jq -n \
      --arg title  "SSH Failed Login: user '$USER'" \
      --arg ip     "$IP" \
      --arg msg    "$LINE" \
      '{
        alerts: [{ title: $title, severity: "HIGH", ipAddress: $ip, status: "OPEN" }],
        logs:   [{ type: "AUTH", message: $msg, ipAddress: $ip, severity: "HIGH", endpoint: "sshd" }]
      }')

    RESP=$(curl -sf -X POST "$INGEST_URL/api/ingest/bulk" \
      -H "Content-Type: application/json" \
      -H "X-API-Key: $API_KEY" \
      -d "$PAYLOAD")

    echo "[$(date '+%H:%M:%S')] 🔴 HIGH | SSH Failed Login from $IP (user: $USER)"

  # ── Accepted (successful) SSH login ─────────────────────────
  elif echo "$LINE" | grep -qE "Accepted password|Accepted publickey"; then
    IP=$(echo "$LINE" | grep -oP '(\d{1,3}\.){3}\d{1,3}' | head -1)
    [ -z "$IP" ] && IP="$LOCAL_IP"
    USER=$(echo "$LINE" | grep -oP '(?<=for )(\S+)' | head -1)
    [ -z "$USER" ] && USER="unknown"

    PAYLOAD=$(jq -n \
      --arg title "SSH Successful Login: user '$USER'" \
      --arg ip    "$IP" \
      --arg msg   "$LINE" \
      '{
        alerts: [{ title: $title, severity: "LOW", ipAddress: $ip, status: "OPEN" }],
        logs:   [{ type: "AUTH", message: $msg, ipAddress: $ip, severity: "LOW", endpoint: "sshd" }]
      }')

    curl -sf -X POST "$INGEST_URL/api/ingest/bulk" \
      -H "Content-Type: application/json" \
      -H "X-API-Key: $API_KEY" \
      -d "$PAYLOAD" > /dev/null

    echo "[$(date '+%H:%M:%S')] 🟢 LOW  | SSH Login from $IP (user: $USER)"

  # ── sudo / privilege escalation ─────────────────────────────
  elif echo "$LINE" | grep -qE "sudo.*command|su:"; then
    IP="$LOCAL_IP"
    CMD=$(echo "$LINE" | grep -oP '(?<=COMMAND=).*' | head -1)
    [ -z "$CMD" ] && CMD="privilege escalation"

    PAYLOAD=$(jq -n \
      --arg title "Privilege Escalation: $CMD" \
      --arg ip    "$IP" \
      --arg msg   "$LINE" \
      '{
        alerts: [{ title: $title, severity: "MEDIUM", ipAddress: $ip, status: "OPEN" }],
        logs:   [{ type: "SYSTEM", message: $msg, ipAddress: $ip, severity: "MEDIUM", endpoint: "sudo" }]
      }')

    curl -sf -X POST "$INGEST_URL/api/ingest/bulk" \
      -H "Content-Type: application/json" \
      -H "X-API-Key: $API_KEY" \
      -d "$PAYLOAD" > /dev/null

    echo "[$(date '+%H:%M:%S')] 🟡 MEDIUM | Privilege Escalation on $IP"
  fi

done
