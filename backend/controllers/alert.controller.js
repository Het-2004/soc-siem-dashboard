const Alert = require("../models/Alert");

exports.getAlerts = async (req, res) => {
  const alerts = await Alert.find()
    .sort({ detectedAt: -1 })
    .limit(200);

  res.json(alerts);
};

exports.updateAlertStatus = async (req, res) => {
  const { status } = req.body;

  await Alert.findByIdAndUpdate(req.params.id, { status });
  res.json({ message: "Alert status updated" });
};
