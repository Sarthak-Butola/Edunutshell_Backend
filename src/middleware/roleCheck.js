export const requireRole = (role) => {
  return (req, res, next) => {
    if (req.user.role.toString() !== role.toString()) {
      return res.status(403).json({ message: "Forbidden: Insufficient role" });
    }
    next();
  };
};
