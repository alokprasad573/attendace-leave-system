const express = require("express");
const Attendance = require("../models/Attendance");
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

const router = express.Router();

const startOfDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

router.post("/", authMiddleware, roleMiddleware(["Student"]), async (req, res) => {
  try {
    const today = startOfDay(new Date());

    try {
        const record = await Attendance.create({user: req.user.id, date: today, status: "Present"});  
        return res.status(201).json({message: "Attendance marked successfully", attendance: record});
      } catch (err) {
          return res.status(400).json({message: "Attendance already marked for today", error: err.message});
      }
    } catch (err) {
      return res.status(500).json({message: "Failed to mark attendance", error: err.message});
    }
    
});

router.get("/", authMiddleware, roleMiddleware(["Student"]), async (req, res) => {
  try {
    const records = await Attendance.find({ user: req.user.id }).sort({date: -1});
    return res.status(200).json({attendance: records});
  } catch (err) {
    return res.status(500).json({message: "Failed to fetch attendance", error: err.message});
  }
});

router.get("/all", authMiddleware, roleMiddleware(["Admin"]), async (_req, res) => {
  try {
    const records = await Attendance.find().populate("user", "name email role").sort({date: -1});
      return res.status(200).json({ attendance: records });
    } catch (err) {
      return res
        .status(500)
        .json({ message: "Failed to fetch all attendance", error: err.message });
    }
  }
);

module.exports = router;


