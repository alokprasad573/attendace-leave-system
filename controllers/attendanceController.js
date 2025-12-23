const Attendance = require("../models/Attendance");

const normalizeDate = (date = new Date()) => new Date(new Date(date).setHours(0, 0, 0, 0));
const wantsHtml = (req) => req.headers.accept?.includes("text/html");

const markAttendance = async (req, res) => {
  const today = normalizeDate();
  const existing = await Attendance.findOne({ user: req.user.id, date: today });
  if (existing) return res.status(400).json({ message: "Attendance already marked today" });

  const attendance = new Attendance({ user: req.user.id, status: "Present", date: today });
  await attendance.save();
  return res.json(attendance);
};

const getMyAttendance = async (req, res) => {
  const records = await Attendance.find({ user: req.user.id }).sort({ date: -1 });

  if (wantsHtml(req)) {
    return res.render("attendance/myAttendance", { attendance: records, user: req.user });
  }

  return res.json(records);
};

const getAllAttendance = async (req, res) => {
  const records = await Attendance.find()
    .populate("user", "name email")
    .sort({ date: -1 });

  if (wantsHtml(req)) {
    return res.render("attendance/allAttendance", { attendance: records, user: req.user });
  }

  return res.json(records);
};

module.exports = { markAttendance, getMyAttendance, getAllAttendance };