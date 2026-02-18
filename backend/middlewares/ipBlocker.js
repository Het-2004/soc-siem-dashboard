const BlockedIP = require("../models/BlockedIP");

module.exports = async function ipBlocker(req, res, next) {
  const blocked = await BlockedIP.findOne({ ipAddress: req.ip });

  if (blocked) {
    return res.status(403).json({
      message: "Access denied. Your IP is blocked."
    });
  }

  next();
};
