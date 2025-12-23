const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const { authMiddleware } = require("./middleware/authMiddleware");
const Attendance = require("./models/Attendance");
const Leave = require("./models/Leave");
const User = require("./models/User");

dotenv.config();
const { MONGO_URI, PORT } = process.env;

const authRoutes = require("./routes/authRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const leaveRoutes = require("./routes/leaveRoutes");

const app = express();

// View engine setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Minimal cookie parser (avoids extra dependency)
app.use((req, _res, next) => {
  const raw = req.headers.cookie;
  req.cookies = {};
  if (raw) {
    raw.split(";").forEach((pair) => {
      const [key, ...val] = pair.trim().split("=");
      req.cookies[key] = decodeURIComponent(val.join("="));
    });
  }
  next();
});

// Support HTML form overrides (e.g., PATCH via _method)
app.use((req, _res, next) => {
  if (req.method === "POST") {
    const override = req.body?._method || req.query?._method;
    if (override) {
      req.method = override.toUpperCase();
    }
  }
  next();
});

mongoose
  .connect(MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("Mongo connection error", err));

app.get("/", (_req, res) => res.redirect("/dashboard"));
// Graceful handling of common typo
app.get("/dashborad", (_req, res) => res.redirect("/dashboard"));
app.get("/dashboard", authMiddleware, async (req, res, next) => {
  try {
    if (req.user.role === "Student") {
      const attendance = await Attendance.find({ user: req.user.id }).sort({ date: -1 }).limit(5);
      const leaves = await Leave.find({ user: req.user.id }).sort({ createdAt: -1 }).limit(5);
      return res.render("dashboard", {
        user: req.user,
        attendance,
        leaves,
        stats: null
      });
    }

    // Admin view: basic stats and latest items
    const [userCount, attendanceCount, leavePending, recentAttendance, pendingLeaves] = await Promise.all([
      User.countDocuments({}),
      Attendance.countDocuments({}),
      Leave.countDocuments({ status: "pending" }),
      Attendance.find().populate("user", "name email").sort({ date: -1 }).limit(5),
      Leave.find({ status: "pending" }).populate("user", "name email").sort({ createdAt: -1 }).limit(5)
    ]);

    return res.render("dashboard", {
      user: req.user,
      attendance: recentAttendance,
      leaves: pendingLeaves,
      stats: { userCount, attendanceCount, leavePending }
    });
  } catch (err) {
    next(err);
  }
});

app.use("/auth", authRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/leave", leaveRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send("Something went wrong");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));