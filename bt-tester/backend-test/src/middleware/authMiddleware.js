import jwt from "jsonwebtoken";

export const isAuthenticated = (req, res, next) => {
  const auth = req.headers.authorization;
  if (!auth) return res.status(401).json({ error: "Missing token" });
  const token = auth.split(" ")[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = payload; // { userId, role, iat, exp }
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid token" });
  }
};
