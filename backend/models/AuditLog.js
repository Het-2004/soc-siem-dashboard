const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema({
  action: String,
  performedBy: String,
  role: String,
  ipAddress: String,
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AuditLog", auditLogSchema);
