/**
 * SOC/SIEM Dashboard — Utility Script
 * Run: node clear-db.js
 * 
 * Purges all Alerts, Logs, Incidents, and Audit Logs from the database
 * to ensure that you are starting with a clean slate for real-world data ingestion.
 * 
 * IMPORTANT: This preserves your Admin and Analyst Users so you can still log in.
 */
const mongoose = require("mongoose");
const dotenv = require("dotenv");
dotenv.config();

const Alert    = require("./models/Alert");
const Log      = require("./models/Log");
const Incident = require("./models/Incident");
const AuditLog = require("./models/AuditLog");

async function clearDb() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");

    console.log("🗑️  Purging all SIEM Event Data (Alerts, Logs, Incidents, Audit Logs)...");

    const [alertResult, logResult, incidentResult, auditResult] = await Promise.all([
      Alert.deleteMany({}),
      Log.deleteMany({}),
      Incident.deleteMany({}),
      AuditLog.deleteMany({})
    ]);

    console.log(`🧹 Deleted ${alertResult.deletedCount} Alerts`);
    console.log(`🧹 Deleted ${logResult.deletedCount} Logs`);
    console.log(`🧹 Deleted ${incidentResult.deletedCount} Incidents`);
    console.log(`🧹 Deleted ${auditResult.deletedCount} Audit Logs`);

    console.log("\n✅ Database is now pristine and ready for purely real-world data ingestion!");
    await mongoose.disconnect();
    process.exit(0);

  } catch (err) {
    console.error("❌ Failed to clear database:", err.message);
    process.exit(1);
  }
}

clearDb();
