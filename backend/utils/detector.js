const Alert = require("../models/Alert");

module.exports = async (log) => {
  if (log.type === "LOGIN" && log.severity === "HIGH") {
    await Alert.create({
      title: "Brute Force Detected",
      severity: "HIGH",
      ipAddress: log.ipAddress
    });
  }
};

// Threat detection engine
// Detects suspicious behavior from logs
// Generates alerts and emits real-time events

module.exports = async function detectThreat(log) {
  if (log.type === "LOGIN" && log.severity === "HIGH") {
    // Brute force detection
    // Emit alert to SOC dashboard
  }
};

global.io.emit("new-alert", {
  title: "Brute Force Attack Detected",
  severity: "HIGH",
  time: new Date()
});
