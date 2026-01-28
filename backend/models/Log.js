const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  type: String,
  message: String,
  ipAddress: String,
  severity: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Log", logSchema);
