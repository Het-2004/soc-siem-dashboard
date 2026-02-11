const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  title: String,
  severity: String,
  ipAddress: String,
  status: { type: String, default: "OPEN" },
  createdAt: { type: Date, default: Date.now }
});

alertSchema.index({ severity: 1 });
alertSchema.index({ createdAt: -1 });

// 🔹 Added indexes for faster queries based on severity and creation time

module.exports = mongoose.model("Alert", alertSchema);
