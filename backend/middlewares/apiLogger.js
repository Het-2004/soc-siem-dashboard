const { createLog } = require("../controllers/log.controller");

module.exports = (req, res, next) => {
  createLog({
    type: "API",
    message: "API accessed",
    endpoint: req.originalUrl,
    ipAddress: req.ip,
    severity: "LOW"
  });
  next();
};
