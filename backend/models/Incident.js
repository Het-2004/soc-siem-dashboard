const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema({
  alertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alert",
    required: [true, "Alert reference is required"]
  },
  title: {
    type: String,
    required: [true, "Incident title is required"],
    trim: true,
    maxlength: [300, "Title cannot exceed 300 characters"]
  },
  severity: {
    type: String,
    enum: { values: ["HIGH", "MEDIUM", "LOW"], message: "Severity must be HIGH, MEDIUM, or LOW" },
    required: [true, "Severity is required"],
    uppercase: true
  },
  status: {
    type: String,
    enum: { values: ["OPEN", "INVESTIGATING", "RESOLVED"], message: "Invalid status value" },
    default: "OPEN"
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null
  },
  notes: [
    {
      message: { type: String, trim: true },
      by: String,
      date: { type: Date, default: Date.now }
    }
  ],
  timeline: [
    {
      note: { type: String, trim: true },
      addedBy: String,
      addedAt: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

incidentSchema.index({ status: 1 });
incidentSchema.index({ severity: 1 });
incidentSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Incident", incidentSchema);
