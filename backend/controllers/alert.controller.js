const Alert = require("../models/Alert");

exports.getAlerts = async (req, res) => {
  try {
    const alerts = await Alert.find()
      .sort({ createdAt: -1 })
      .limit(200);

    res.json(alerts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.updateAlertStatus = async (req, res) => {
  try {
    const { status } = req.body;

    await Alert.findByIdAndUpdate(req.params.id, { status });
    res.json({ message: "Alert status updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
