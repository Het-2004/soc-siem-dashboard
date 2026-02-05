const express = require("express");
const router = express.Router();
const AuditLog = require("../models/AuditLog");
const auth = require("../middlewares/auth.middleware");
const rbac = require("../middlewares/rbac.middleware");

router.get("/", auth, rbac("ADMIN"), async (req, res) => {
  const logs = await AuditLog.find().sort({ timestamp: -1 });
  res.json(logs);
});

module.exports = router;
