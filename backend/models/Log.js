const mongoose = require("mongoose");

const logSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["AUTH", "NETWORK", "SYSTEM", "API", "FIREWALL", "EXTERNAL", "APP", "DATABASE"],
    default: "EXTERNAL",
    uppercase: true
  },
  message: {
    type: String,
    required: [true, "Log message is required"],
    trim: true,
    maxlength: [1000, "Message cannot exceed 1000 characters"]
  },
  ipAddress: {
    type: String,
    required: [true, "IP Address is required"],
    trim: true,
    maxlength: [64, "IP cannot exceed 64 characters"]
  },
  severity: {
    type: String,
    enum: ["HIGH", "MEDIUM", "LOW"],
    default: "LOW",
    uppercase: true
  },
  endpoint: {
    type: String,
    trim: true,
    maxlength: [256, "Endpoint cannot exceed 256 characters"]
  },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for faster queries
logSchema.index({ createdAt: -1 });
logSchema.index({ severity: 1 });
logSchema.index({ type: 1 });

module.exports = mongoose.model("Log", logSchema);
