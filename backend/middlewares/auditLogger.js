const AuditLog = require("../models/AuditLog");

module.exports = async function auditLogger(req, res, next) {
  if (req.user) {
    try {
      await AuditLog.create({
        action: `${req.method} ${req.originalUrl}`,
        performedBy: req.user.id,
        role: req.user.role,
        ipAddress: req.ip
      });
    } catch (err) {
      console.error("Audit log error:", err);
    }
  }
  next();
};
