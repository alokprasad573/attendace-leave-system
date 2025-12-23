const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "devsecret";

const wantsHtml = (req) => req.headers.accept?.includes("text/html");

const authMiddleware = (req, res, next) => {
  const bearerToken = req.headers.authorization?.split(" ")[1];
  const cookieToken = req.cookies?.token;
  const token = bearerToken || cookieToken;

  if (!token) {
    console.warn("Auth: no token found");
    return wantsHtml(req)
      ? res.redirect("/auth/login")
      : res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    res.locals.user = decoded;
    next();
  } catch (err) {
    console.warn("Auth: invalid token", err?.message);
    return wantsHtml(req)
      ? res.redirect("/auth/login")
      : res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { authMiddleware };