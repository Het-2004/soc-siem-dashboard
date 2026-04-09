const mongoose = require("mongoose");

const alertSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Alert title is required"],
    trim: true,
    maxlength: [300, "Title cannot exceed 300 characters"]
  },
  severity: {
    type: String,
    required: [true, "Severity is required"],
    enum: { values: ["HIGH", "MEDIUM", "LOW"], message: "Severity must be HIGH, MEDIUM or LOW" },
    uppercase: true
  },
  ipAddress: {
    type: String,
    required: [true, "IP Address is required"],
    trim: true,
    maxlength: [64, "IP Address cannot exceed 64 characters"]
  },
  status: {
    type: String,
    enum: { values: ["OPEN", "ACKNOWLEDGED", "RESOLVED"], message: "Invalid status value" },
    default: "OPEN"
  },
  // GeoIP fields — populated by ingest endpoint
  lat:     { type: Number, default: null },
  lng:     { type: Number, default: null },
  country: { type: String, default: null },
  city:    { type: String, default: null },
  createdAt: { type: Date, default: Date.now }
});

// Indexes for faster queries
alertSchema.index({ severity: 1 });
alertSchema.index({ createdAt: -1 });
alertSchema.index({ status: 1, severity: 1 });
alertSchema.index({ ipAddress: 1, severity: 1, createdAt: -1 }); // for auto-incident aggregation

module.exports = mongoose.model("Alert", alertSchema);
