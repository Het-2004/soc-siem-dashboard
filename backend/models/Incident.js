const mongoose = require("mongoose");

const incidentSchema = new mongoose.Schema({
  alertId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Alert",
    required: true
  },
  title: String,
  severity: String,
  status: {
    type: String,
    enum: ["OPEN", "INVESTIGATING", "RESOLVED"],
    default: "OPEN"
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  notes: [
    {
      message: String,
      by: String,
      date: { type: Date, default: Date.now }
    }
  ]
}, { timestamps: true });

module.exports = mongoose.model("Incident", incidentSchema);
