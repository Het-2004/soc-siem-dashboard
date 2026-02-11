const express = require("express");
const router = express.Router();
const Alert = require("../models/Alert");
const auth = require("../middlewares/auth.middleware");

router.get("/", auth, async (req, res) => {
  const total = await Alert.countDocuments();
  const high = await Alert.countDocuments({ severity: "HIGH" });
  const medium = await Alert.countDocuments({ severity: "MEDIUM" });
  const low = await Alert.countDocuments({ severity: "LOW" });

  res.json({ total, high, medium, low });
});

module.exports = router;
