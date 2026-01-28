const { createLog } = require("../controllers/log.controller");

module.exports = (err, req, res, next) => {
  createLog({
    type: "SYSTEM",
    message: err.message,
    endpoint: req.originalUrl,
    ipAddress: req.ip,
    severity: "HIGH"
  });
  res.status(500).json({ message: "Internal Server Error" });
};
