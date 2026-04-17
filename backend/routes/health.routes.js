const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

router.get("/", (req, res) => {
  const dbState = mongoose.connection.readyState;
  // 0: disconnected, 1: connected, 2: connecting, 3: disconnecting
  const isHealthy = dbState === 1;

  res.status(isHealthy ? 200 : 503).json({
    status: isHealthy ? "UP" : "DEGRADED",
    service: "SOC / SIEM Backend",
    database: isHealthy ? "connected" : "disconnected",
    time: new Date()
  });
});

module.exports = router;
