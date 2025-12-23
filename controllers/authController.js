const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

const signupPage = (_req, res) => res.render("auth/signup", { user: null });
const loginPage = (_req, res) => res.render("auth/login", { user: null });

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, role });
    await user.save();
    if (req.headers.accept?.includes("application/json")) {
      return res.json({ message: "User registered successfully" });
    }
    return res.redirect("/auth/login");
  } catch (err) {
    console.error("Signup failed", err);
    return res.status(400).json({ message: "Unable to signup" });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ message: "Invalid credentials" });

    const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "1d" });
    const wantsJson = req.headers.accept?.includes("application/json");

    // Always set cookie so browser sessions work
    res.cookie("token", token, {
      httpOnly: true,
      maxAge: 24 * 60 * 60 * 1000,
      sameSite: "lax",
      path: "/"
    });

    if (wantsJson) {
      return res.json({ token });
    }

    return res.redirect("/dashboard");
  } catch (err) {
    console.error("Login failed", err);
    return res.status(400).json({ message: "Invalid credentials" });
  }
};

const logout = (_req, res) => {
  res.clearCookie("token");
  return res.redirect("/auth/login");
};

module.exports = { signup, login, signupPage, loginPage, logout };