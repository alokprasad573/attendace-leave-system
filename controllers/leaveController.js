const Leave = require("../models/Leave");
const wantsHtml = (req) => req.headers.accept?.includes("text/html");

const requestLeave = async (req, res) => {
  const leave = new Leave({ user: req.user.id, reason: req.body.reason });
  await leave.save();
  return res.json(leave);
};

const updateLeaveStatus = async (req, res) => {
  const leave = await Leave.findById(req.params.id);
  if (!leave) return res.status(404).json({ message: "Leave not found" });
  leave.status = req.body.status;
  await leave.save();
  if (wantsHtml(req)) {
    return res.redirect("/leave/all");
  }
  return res.json(leave);
};

const getMyLeaves = async (req, res) => {
  const leaves = await Leave.find({ user: req.user.id }).sort({ createdAt: -1 });
  if (wantsHtml(req)) {
    return res.render("leave/myLeaves", { leaves, user: req.user });
  }
  return res.json(leaves);
};

const getAllLeaves = async (req, res) => {
  const leaves = await Leave.find().populate("user", "name").sort({ createdAt: -1 });
  if (wantsHtml(req)) {
    return res.render("leave/manageLeaves", { leaves, user: req.user });
  }
  return res.json(leaves);
};

module.exports = { requestLeave, updateLeaveStatus, getMyLeaves, getAllLeaves };