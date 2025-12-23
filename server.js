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

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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


app.use("/auth", authRoutes);
app.use("/attendance", attendanceRoutes);
app.use("/leave", leaveRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).send("Something went wrong");
});

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));