const express = require("express");
const router = express.Router();
const auth = require("../middlewares/auth.middleware");
const rbac = require("../middlewares/rbac.middleware");
const {
  createIncident,
  getIncidents,
  assignIncident,
  updateStatus
} = require("../controllers/incident.controller");

router.post("/", auth, rbac("ADMIN"), createIncident);
router.get("/", auth, rbac("ADMIN", "ANALYST"), getIncidents);
router.put("/:id/assign", auth, rbac("ADMIN"), assignIncident);
router.put("/:id/status", auth, rbac("ADMIN", "ANALYST"), updateStatus);

module.exports = router;
