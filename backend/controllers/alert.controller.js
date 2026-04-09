const Alert = require("../models/Alert");

const VALID_STATUSES = ["OPEN", "ACKNOWLEDGED", "RESOLVED"];

exports.getAlerts = async (req, res) => {
  try {
    const { severity, status, limit = 200 } = req.query;
    const filter = {};
    if (severity && ["HIGH", "MEDIUM", "LOW"].includes(severity.toUpperCase())) {
      filter.severity = severity.toUpperCase();
    }
    if (status && VALID_STATUSES.includes(status.toUpperCase())) {
      filter.status = status.toUpperCase();
    }

    const alerts = await Alert.find(filter)
      .sort({ createdAt: -1 })
      .limit(Math.min(Number(limit) || 200, 500));

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAlertStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!status || !VALID_STATUSES.includes(status.toUpperCase())) {
      return res.status(400).json({
        message: `Invalid status. Must be one of: ${VALID_STATUSES.join(", ")}`
      });
    }

    const alert = await Alert.findByIdAndUpdate(
      req.params.id,
      { status: status.toUpperCase() },
      { new: true, runValidators: true }
    );

    if (!alert) {
      return res.status(404).json({ message: "Alert not found" });
    }

    res.json({ message: "Alert status updated", alert });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
