const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  type: String,
  message: String,
  ipAddress: String,
  severity: String,
  endpoint: String,
  createdAt: { type: Date, default: Date.now }
});

// 🔹 Added index for faster time-based queries
logSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Log", logSchema);
