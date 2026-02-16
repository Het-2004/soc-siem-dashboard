const Log = require("../models/Log");
const Alert = require("../models/Alert");

module.exports = async function detectThreat(log) {

  // Count logs from same IP in last 10 minutes
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  const ipActivityCount = await Log.countDocuments({
    ipAddress: log.ipAddress,
    createdAt: { $gte: tenMinutesAgo }
  });

  // If IP exceeds 10 actions → mark suspicious
  if (ipActivityCount >= 10) {

    const alert = await Alert.create({
      title: "Suspicious IP Activity Detected",
      severity: "HIGH",
      ipAddress: log.ipAddress
    });

    // Emit real-time alert
    if (global.io) {
      global.io.emit("new-alert", {
        title: alert.title,
        severity: alert.severity,
        ip: alert.ipAddress
      });
    }
  }
};
