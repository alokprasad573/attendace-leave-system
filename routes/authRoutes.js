const express = require("express");
const { signup, login, signupPage, loginPage, logout } = require("../controllers/authController");

const router = express.Router();

router.get("/signup", signupPage);
router.get("/login", loginPage);
router.get("/logout", logout);
router.post("/signup", signup);
router.post("/login", login);

module.exports = router;