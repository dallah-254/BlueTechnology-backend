import express from "express";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";

const router = express.Router();

// List public products
router.get("/", async (req, res) => {
    const products = await prisma.product.findMany();
    res.json(products);
});

// Get one
router.get("/:id", async (req, res) => {
    const id = Number(req.params.id);
    const p = await prisma.product.findUnique({ where: { id } });
    if (!p) return res.status(404).json({ error: "Not found" });
    res.json(p);
});

// Admin create/update/delete
router.post("/", isAuthenticated, requireRole("admin"), async (req, res) => {
    const { name, description, price, stock, imageUrl } = req.body;
    const created = await prisma.product.create({
        data: { name, description, price: Number(price), stock: Number(stock), imageUrl }
    });
    res.json(created);
});

router.put("/:id", isAuthenticated, requireRole("admin"), async (req, res) => {
    const id = Number(req.params.id);
    const updated = await prisma.product.update({
        where: { id },
        data: req.body
    });
    res.json(updated);
});

router.delete("/:id", isAuthenticated, requireRole("admin"), async (req, res) => {
    const id = Number(req.params.id);
    await prisma.product.delete({ where: { id } });
    res.json({ success: true });
});

export default router;
