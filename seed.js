const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");
dotenv.config();
const { MONGO_URI } = process.env;

// Import models
const User = require("./models/User");
const Attendance = require("./models/Attendance");
const Leave = require("./models/Leave");

const seedData = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    // Clear existing data
    await User.deleteMany({});
    await Attendance.deleteMany({});
    await Leave.deleteMany({});
    console.log("Cleared old data");

    // Users
    const users = await User.insertMany([
      {
        name: "Admin User",
        email: "admin@example.com",
        password: await bcrypt.hash("123456", 10),
        role: "Admin"
      },
      {
        name: "John Doe",
        email: "john@example.com",
        password: await bcrypt.hash("123456", 10),
        role: "Student"
      },
      {
        name: "Jane Smith",
        email: "jane@example.com",
        password: await bcrypt.hash("123456", 10),
        role: "Student"
      },
      {
        name: "Rahul Kumar",
        email: "rahul@example.com",
        password: await bcrypt.hash("123456", 10),
        role: "Student"
      },
      {
        name: "Emily Davis",
        email: "emily@example.com",
        password: await bcrypt.hash("123456", 10),
        role: "Student"
      }
    ]);
    console.log("👤 Users seeded");

    // Attendance
    const attendance = [
      { user: users[1]._id, date: new Date("2025-12-01"), status: "Present" },
      { user: users[1]._id, date: new Date("2025-12-02"), status: "Absent" },
      { user: users[2]._id, date: new Date("2025-12-01"), status: "Present" },
      { user: users[2]._id, date: new Date("2025-12-02"), status: "Present" },
      { user: users[3]._id, date: new Date("2025-12-01"), status: "Absent" },
      { user: users[3]._id, date: new Date("2025-12-02"), status: "Present" },
      { user: users[4]._id, date: new Date("2025-12-01"), status: "Present" },
      { user: users[4]._id, date: new Date("2025-12-02"), status: "Absent" },
      { user: users[1]._id, date: new Date("2025-12-03"), status: "Present" },
      { user: users[2]._id, date: new Date("2025-12-03"), status: "Absent" }
    ];
    await Attendance.insertMany(attendance);
    console.log("Attendance seeded");

    // Leaves
    const leaves = [
      { user: users[1]._id, reason: "Medical appointment", status: "pending" },
      { user: users[2]._id, reason: "Family function", status: "approved" },
      { user: users[3]._id, reason: "Travel", status: "rejected" },
      { user: users[4]._id, reason: "Exam preparation", status: "pending" },
      { user: users[1]._id, reason: "Personal work", status: "approved" },
      { user: users[2]._id, reason: "Festival celebration", status: "pending" },
      { user: users[3]._id, reason: "Urgent family matter", status: "approved" },
      { user: users[4]._id, reason: "Doctor visit", status: "rejected" },
      { user: users[1]._id, reason: "Sports event", status: "pending" },
      { user: users[2]._id, reason: "Vacation", status: "approved" }
    ];
    await Leave.insertMany(leaves);
    console.log("Leaves seeded");

    console.log("Seeding completed successfully!");
    mongoose.connection.close();
  } catch (err) {
    console.error("Error seeding data:", err);
    mongoose.connection.close();
  }
};

seedData();