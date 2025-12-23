const express = require("express");
const { authMiddleware } = require("../middleware/authMiddleware");
const { roleMiddleware } = require("../middleware/roleMiddleware");
const { requestLeave, updateLeaveStatus, getMyLeaves, getAllLeaves } = require("../controllers/leaveController");

const router = express.Router();
router.post("/", authMiddleware, roleMiddleware(["Student"]), requestLeave);
router.get("/", authMiddleware, roleMiddleware(["Student"]), getMyLeaves);
router.get("/all", authMiddleware, roleMiddleware(["Admin"]), getAllLeaves);
router.patch("/:id", authMiddleware, roleMiddleware(["Admin"]), updateLeaveStatus);

module.exports = router;