const Incident = require("../models/Incident");
const Alert = require("../models/Alert");

/* Create Incident from Alert */
exports.createIncident = async (req, res) => {
  const { alertId } = req.body;

  const alert = await Alert.findById(alertId);
  if (!alert) return res.status(404).json({ message: "Alert not found" });

  const incident = await Incident.create({
    alertId: alert._id,
    title: alert.title,
    severity: alert.severity
  });

  alert.status = "ACKNOWLEDGED";
  await alert.save();

  res.status(201).json(incident);
};

/* Get All Incidents */
exports.getIncidents = async (req, res) => {
  const incidents = await Incident.find()
    .populate("assignedTo", "name role")
    .sort({ createdAt: -1 });

  res.json(incidents);
};

/* Assign Analyst */
exports.assignIncident = async (req, res) => {
  const { analystId } = req.body;

  await Incident.findByIdAndUpdate(req.params.id, {
    assignedTo: analystId,
    status: "INVESTIGATING"
  });

  res.json({ message: "Incident assigned to analyst" });
};

/* Update Incident Status */
exports.updateStatus = async (req, res) => {
  const { status, note } = req.body;

  await Incident.findByIdAndUpdate(req.params.id, {
    status,
    $push: {
      timeline: {
        note,
        addedBy: req.user.role
      }
    }
  });

  res.json({ message: "Incident updated" });
};
