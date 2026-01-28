const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  title: String,
  severity: String,
  ipAddress: String,
  status: { type: String, default: "OPEN" },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Alert", alertSchema);
