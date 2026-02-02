const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.status(200).json({
    status: "UP",
    service: "SOC / SIEM Backend",
    time: new Date()
  });
});

module.exports = router;
