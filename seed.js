const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config();

const { MONGO_URI } = process.env;

const User = require("./models/User");
const Attendance = require("./models/Attendance");
const Leave = require("./models/Leave");

const seed = async () => {
  try {
    if (!MONGO_URI) {
      console.error("MONGO_URI is not defined in .env");
      process.exit(1);
    }

    await mongoose.connect(MONGO_URI);
    console.log("✅ Connected to MongoDB");

    await Promise.all([
      User.deleteMany({}),
      Attendance.deleteMany({}),
      Leave.deleteMany({})
    ]);
    console.log("🧹 Cleared existing collections");

    const passwordHash = await bcrypt.hash("123456", 10);

    const usersData = [
      {
        name: "Admin User",
        email: "admin@example.com",
        role: "Admin"
      }
    ];

    for (let i = 1; i <= 19; i++) {
      usersData.push({
        name: `Student ${i}`,
        email: `student${i}@example.com`,
        role: "Student"
      });
    }

    const users = await User.insertMany(
      usersData.map((u) => ({
        ...u,
        password: passwordHash
      }))
    );

    console.log(`👤 Inserted ${users.length} users (1 Admin + 19 Students)`);

    const attendanceDocs = [];
    const today = new Date();

    const startOfDay = (d) => {
      const date = new Date(d);
      date.setHours(0, 0, 0, 0);
      return date;
    };

    const studentUsers = users.filter((u) => u.role === "Student");

    studentUsers.slice(0, 5).forEach((student, idx) => {
      for (let offset = 0; offset < 5; offset++) {
        const date = new Date(today);
        date.setDate(today.getDate() - offset);
        attendanceDocs.push({
          user: student._id,
          date: startOfDay(date),
          status: offset % 2 === (idx % 2) ? "Present" : "Absent"
        });
      }
    });

    await Attendance.insertMany(attendanceDocs);
    console.log(`📝 Inserted ${attendanceDocs.length} attendance records`);

    const reasons = [
      "Medical appointment",
      "Family function",
      "Exam preparation",
      "Urgent personal work",
      "Out of station"
    ];

    const leaveDocs = [];
    studentUsers.slice(0, 5).forEach((student, idx) => {
      reasons.forEach((reason, rIdx) => {
        const statuses = ["pending", "approved", "rejected"];
        leaveDocs.push({
          user: student._id,
          reason: `${reason} ${rIdx + 1}`,
          status: statuses[(idx + rIdx) % statuses.length]
        });
      });
    });

    await Leave.insertMany(leaveDocs);
    console.log(`📅 Inserted ${leaveDocs.length} leave records`);

    console.log("✅ Seeding completed successfully");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Error while seeding data:", err);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seed();


