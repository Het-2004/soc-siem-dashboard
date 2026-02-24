const BlockedIP = require("../models/BlockedIP");
const logger = require("../utils/logger");

module.exports = async function ipBlocker(req, res, next) {
  try {
    const blocked = await BlockedIP.findOne({ ipAddress: req.ip });

    if (blocked) {
      return res.status(403).json({
        message: "Access denied. Your IP is blocked."
      });
    }

    next();
  } catch (error) {
    logger.error("IP block check failed", error);
    next();
  }
};
