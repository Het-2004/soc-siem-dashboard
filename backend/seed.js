/**
 * SOC/SIEM Dashboard — Seed Script
 * Run: node seed.js
 * Creates demo users, alerts, logs, incidents, and audit logs.
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const User     = require("./models/User");
const Alert    = require("./models/Alert");
const Log      = require("./models/Log");
const Incident = require("./models/Incident");
const AuditLog = require("./models/AuditLog");

const ALERTS = [
  { title: "Brute Force Attack Detected",      severity: "HIGH",   ipAddress: "192.168.1.100", status: "OPEN" },
  { title: "SQL Injection Attempt",            severity: "HIGH",   ipAddress: "10.0.0.45",     status: "ACKNOWLEDGED" },
  { title: "Port Scan Detected",               severity: "MEDIUM", ipAddress: "172.16.0.22",   status: "OPEN" },
  { title: "Unusual Login Time",               severity: "LOW",    ipAddress: "192.168.1.55",  status: "RESOLVED" },
  { title: "Malware Signature Found",          severity: "HIGH",   ipAddress: "10.0.0.78",     status: "OPEN" },
  { title: "DDoS Attack Pattern",              severity: "HIGH",   ipAddress: "203.0.113.45",  status: "OPEN" },
  { title: "Privilege Escalation Attempt",     severity: "HIGH",   ipAddress: "192.168.2.10",  status: "ACKNOWLEDGED" },
  { title: "Unauthorized File Access",         severity: "MEDIUM", ipAddress: "192.168.1.200", status: "OPEN" },
  { title: "Phishing Email Detected",          severity: "MEDIUM", ipAddress: "10.0.1.15",     status: "RESOLVED" },
  { title: "Suspicious DNS Query",             severity: "LOW",    ipAddress: "192.168.3.44",  status: "OPEN" },
  { title: "Multiple Failed Authentications",  severity: "MEDIUM", ipAddress: "172.16.1.100",  status: "OPEN" },
  { title: "Crypto Mining Activity",           severity: "HIGH",   ipAddress: "10.0.2.88",     status: "OPEN" },
  { title: "Data Exfiltration Attempt",        severity: "HIGH",   ipAddress: "192.168.4.5",   status: "ACKNOWLEDGED" },
  { title: "Ransomware Behavior Detected",     severity: "HIGH",   ipAddress: "10.0.3.22",     status: "OPEN" },
  { title: "Anomalous Outbound Traffic",       severity: "MEDIUM", ipAddress: "172.16.2.99",   status: "OPEN" },
];

const LOG_TYPES    = ["AUTH", "NETWORK", "SYSTEM", "API", "FIREWALL"];
const LOG_MESSAGES = [
  "Access denied for restricted resource",
  "Outbound connection established",
  "System service restarted",
  "Configuration file modified",
  "Firewall rule triggered",
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("✅ Connected to MongoDB");

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Alert.deleteMany({}),
    Log.deleteMany({}),
    Incident.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);
  console.log("🗑️  Cleared existing data");

  // Users
  const admin   = await User.create({ name: "Admin User",  email: "admin@soc.com",   password: "admin123",   role: "ADMIN"   });
  const analyst = await User.create({ name: "SOC Analyst", email: "analyst@soc.com", password: "analyst123", role: "ANALYST" });
  console.log("👤 Created users");

  // Alerts — spread over the last 7 days so trend chart is populated
  const now = Date.now();
  const alertDocs = ALERTS.map((a, i) => ({
    ...a,
    createdAt: new Date(now - (i % 7) * 24 * 60 * 60 * 1000),
  }));
  const alerts = await Alert.insertMany(alertDocs);
  console.log(`🚨 Created ${alerts.length} alerts`);

  // Logs
  const logs = Array.from({ length: 20 }, (_, i) => ({
    type:      LOG_TYPES[i % LOG_TYPES.length],
    message:   LOG_MESSAGES[i % LOG_MESSAGES.length],
    ipAddress: `192.168.${Math.floor(i / 5)}.${(i * 13) % 254 + 1}`,
    severity:  ["HIGH", "MEDIUM", "LOW"][i % 3],
    endpoint:  `/api/${["alerts", "logs", "auth/login", "incidents", "stats"][i % 5]}`,
    createdAt: new Date(now - i * 3 * 60 * 60 * 1000),
  }));
  await Log.insertMany(logs);
  console.log(`📝 Created ${logs.length} logs`);

  // Incidents
  await Incident.insertMany([
    {
      alertId:    alerts[0]._id,
      title:      alerts[0].title,
      severity:   "HIGH",
      status:     "INVESTIGATING",
      assignedTo: analyst._id,
      timeline: [
        { note: "Incident created from alert. Assigned to SOC Analyst.", addedBy: "ADMIN" },
        { note: "Initial triage completed. Isolating affected host.",    addedBy: "ANALYST" },
      ],
    },
    {
      alertId:  alerts[4]._id,
      title:    alerts[4].title,
      severity: "HIGH",
      status:   "OPEN",
      timeline: [],
    },
    {
      alertId:    alerts[1]._id,
      title:      alerts[1].title,
      severity:   "HIGH",
      status:     "RESOLVED",
      assignedTo: analyst._id,
      timeline: [
        { note: "False positive confirmed after log review.", addedBy: "ANALYST" },
        { note: "Marked resolved. No action required.",       addedBy: "ADMIN"   },
      ],
    },
  ]);
  console.log("🔴 Created incidents");

  // Audit logs
  const actions = [
    "GET /api/alerts", "POST /api/incidents", "PUT /api/alerts/:id",
    "GET /api/logs", "GET /api/audit-logs", "GET /api/stats",
    "PUT /api/incidents/:id/status", "GET /api/trends",
    "POST /api/auth/login", "GET /api/incidents",
  ];
  await AuditLog.insertMany(
    actions.map((action, i) => ({
      action,
      performedBy: i % 2 === 0 ? admin._id.toString() : analyst._id.toString(),
      role:        i % 2 === 0 ? "ADMIN" : "ANALYST",
      ipAddress:   `192.168.1.${(i * 7) % 254 + 1}`,
      timestamp:   new Date(now - i * 60 * 60 * 1000),
    }))
  );
  console.log("📋 Created audit logs");

  console.log("\n🎉 Seed complete!\n");
  console.log("  Admin:   admin@soc.com   / admin123");
  console.log("  Analyst: analyst@soc.com / analyst123\n");

  await mongoose.disconnect();
}

seed().catch(err => {
  console.error("❌ Seed failed:", err.message);
  process.exit(1);
});
