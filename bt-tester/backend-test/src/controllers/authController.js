import express from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { body, validationResult } from "express-validator";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();

const router = express.Router();

router.post("/signup",
  body("username").isLength({ min: 3 }),
  body("password").isLength({ min: 6 }),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { username, password, role } = req.body;
    const hashed = await bcrypt.hash(password, 10);
    try {
      const user = await prisma.user.create({
        data: { username, password: hashed, role: role || "customer" }
      });
      res.json({ id: user.id, username: user.username, role: user.role });
    } catch (err) {
      return res.status(400).json({ error: "Username already exists" });
    }
  });

router.post("/login",
  body("username").exists(),
  body("password").exists(),
  async (req, res) => {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) return res.status(401).json({ error: "Invalid credentials" });
    const ok = await bcrypt.compare(password, user.password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
    res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
  });

export default router;
