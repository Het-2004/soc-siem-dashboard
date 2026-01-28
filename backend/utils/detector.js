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

global.io.emit("new-alert", {
  title: "Brute Force Attack Detected",
  severity: "HIGH",
  time: new Date()
});
