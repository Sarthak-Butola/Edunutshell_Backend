export const requireRole = (role) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ message: "Unauthorized: No role found" });
    }

    if (req.user.role.toString() !== role.toString()) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }

    next();
  };
};
