export const requireRole = (...allowed) => (req, res, next) => {
  const role = req.user?.role;
  if (!role) return res.status(401).json({ error: "Unauthorized" });
  if (allowed.includes(role)) return next();
  return res.status(403).json({ error: "Forbidden" });
};
