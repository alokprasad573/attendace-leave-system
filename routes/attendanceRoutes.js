const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");
const { markAttendance, getMyAttendance, getAllAttendance } = require("../controllers/attendanceController");

const router = express.Router();
router.post("/", authMiddleware, roleMiddleware(["Student"]), markAttendance);
router.get("/", authMiddleware, roleMiddleware(["Student"]), getMyAttendance);
router.get("/all", authMiddleware, roleMiddleware(["Admin"]), getAllAttendance);

module.exports = router;