import express from "express";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const services = await prisma.service.findMany();
  res.json(services);
});

router.post("/", isAuthenticated, requireRole("admin"), async (req, res) => {
  const { name, description, price, durationMin } = req.body;
  const s = await prisma.service.create({
    data: { name, description, price: Number(price), durationMin: durationMin ? Number(durationMin) : null }
  });
  res.json(s);
});

export default router;
