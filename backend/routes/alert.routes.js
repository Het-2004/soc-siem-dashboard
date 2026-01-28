const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const rbac = require("../middlewares/rbac.middleware");
const {
  getAlerts,
  updateAlertStatus
} = require("../controllers/alert.controller");

router.get("/", auth, rbac("ADMIN", "ANALYST"), getAlerts);
router.put("/:id", auth, rbac("ADMIN"), updateAlertStatus);

module.exports = router;
