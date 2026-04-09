/**
 * autoIncident.js — Background job: auto-create incidents for repeat attackers
 *
 * Runs every 60 seconds. If the same IP address generates 5 or more HIGH-severity
 * OPEN alerts within the last 10 minutes, this job automatically creates an
 * Incident in the database (if one does not already exist for that IP).
 *
 * This mimics a real-world SIEM correlation rule.
 *
 * Registration: called from server.js after connectDB() resolves.
 */

const Alert    = require("../models/Alert");
const Incident = require("../models/Incident");
const logger   = require("../utils/logger");

const WINDOW_MS      = 10 * 60 * 1000; // 10 minutes
const ALERT_THRESHOLD = 5;              // alerts from same IP to trigger incident
const CHECK_INTERVAL  = 60 * 1000;     // run every 60 seconds

async function checkAndCreateIncidents() {
  try {
    const windowStart = new Date(Date.now() - WINDOW_MS);

    // Aggregate: group HIGH OPEN alerts in the last 10 min by IP
    const hotIps = await Alert.aggregate([
      {
        $match: {
          severity: "HIGH",
          status: "OPEN",
          createdAt: { $gte: windowStart }
        }
      },
      {
        $group: {
          _id: "$ipAddress",
          count:   { $sum: 1 },
          alertId: { $first: "$_id" },
          title:   { $first: "$title" },
          country: { $first: "$country" },
          city:    { $first: "$city" }
        }
      },
      {
        $match: { count: { $gte: ALERT_THRESHOLD } }
      }
    ]);

    for (const entry of hotIps) {
      const ip      = entry._id;
      const marker  = `AUTO:${ip}`; // unique identifier in timeline notes

      // Skip if we already have an auto-incident for this IP
      const existing = await Incident.findOne({
        "timeline.note": marker,
        status: { $ne: "RESOLVED" }
      });
      if (existing) continue;

      const geoLabel = entry.city && entry.country
        ? `${entry.city}, ${entry.country}`
        : ip;

      const incident = await Incident.create({
        alertId: entry.alertId,
        title: `[AUTO] Repeated HIGH Alerts from ${geoLabel}`,
        severity: "HIGH",
        status: "OPEN",
        timeline: [
          {
            note: marker, // used for dedup lookup above
            addedBy: "SYSTEM"
          },
          {
            note: `Correlation rule triggered: ${entry.count} HIGH alerts from ${ip} in 10 min. Requires immediate investigation.`,
            addedBy: "SYSTEM"
          }
        ]
      });

      logger.warn("Auto-Incident created", {
        ip,
        alertCount: entry.count,
        incidentId: incident._id.toString()
      });

      // Emit real-time notification if Socket.IO is active
      if (global.io) {
        global.io.emit("new-incident", {
          id: incident._id,
          title: incident.title,
          severity: "HIGH",
          ip
        });
      }
    }
  } catch (err) {
    logger.error("Auto-Incident job error", { error: err.message });
  }
}

// Start the interval and run immediately once
module.exports = function startAutoIncidentJob() {
  logger.info("AutoIncident job started", {
    threshold: ALERT_THRESHOLD,
    windowMinutes: WINDOW_MS / 60000,
    intervalSeconds: CHECK_INTERVAL / 1000
  });

  // Run once immediately on startup, then on interval
  checkAndCreateIncidents();
  setInterval(checkAndCreateIncidents, CHECK_INTERVAL);
};
