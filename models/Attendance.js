const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    date: { type: Date, default: Date.now },
    status: { type: String, enum: ["Present", "Absent"], default: "Present" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Attendance", attendanceSchema);