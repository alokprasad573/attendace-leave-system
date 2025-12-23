const roleMiddleware = (roles = []) => {
  const allowed = Array.isArray(roles) ? roles : [roles];

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const userRole = req.user.role;
    const isAllowed = allowed.includes(userRole);

    if (!isAllowed) {
      return res.status(403).json({ 
        message: "Forbidden: insufficient role",
        required: allowed,
        current: userRole,
      });
    }

    next();
  };
};

module.exports = { roleMiddleware };


