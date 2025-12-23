const express = require("express");
const Leave = require("../models/Leave");
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/all", authMiddleware, roleMiddleware(["Admin"]), async (_req, res) => {
  try {
    const leaves = await Leave.find().populate("user", "name email role").sort({ createdAt: -1 });
    return res.status(200).json({ leaves });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch all leaves", error: err.message });
  }
});

router.patch("/:id", authMiddleware, roleMiddleware(["Admin"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!["pending", "approved", "rejected"].includes(status)) {
      return res.status(400).json({message: "Invalid status. Allowed: pending, approved, rejected"});
    }

    const leave = await Leave.findByIdAndUpdate(id, { status }, { new: true });
    
    if (!leave) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    return res.status(200).json({message: "Leave status updated", leave});
  } catch (err) {
    return res.status(500).json({ message: "Failed to update leave", error: err.message });
  }
});

router.post("/", authMiddleware, roleMiddleware(["Student"]), async (req, res) => {
  try {
    const { reason } = req.body;
    if (!reason) {
      return res.status(400).json({ message: "Reason is required" });
    }

    const leave = await Leave.create({user: req.user.id, reason, status: "pending"});
    return res.status(201).json({ message: "Leave request created", leave});
  } catch (err) {
    return res.status(500).json({ message: "Failed to create leave", error: err.message });
  }
});

router.get("/", authMiddleware, roleMiddleware(["Student"]), async (req, res) => {
  try {
    const leaves = await Leave.find({ user: req.user.id }).sort({ createdAt: -1 });
    return res.status(200).json({ leaves });
  } catch (err) {
    return res.status(500).json({ message: "Failed to fetch leaves", error: err.message });
  }
});

module.exports = router;


