import express from "express";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { sendEmail, orderEmail, productPurchaseEmail } from "../utils/email.js";
import { generateReceiptHtml } from "../utils/receipt.js";
import { uploadReceiptToS3, downloadReceiptFromS3 } from "../utils/s3.js";
import { S3Client } from "@aws-sdk/client-s3";
const s3 = new S3Client({ region: process.env.AWS_REGION });

const router = express.Router();

// create order (customer)
router.post("/", isAuthenticated, requireRole("customer"), async (req, res) => {
    const { items } = req.body; // items: [{ productId, quantity }]
    if (!items || !items.length) return res.status(400).json({ error: "No items" });

    // compute total and ensure stock available
    let total = 0;
    for (const it of items) {
        const p = await prisma.product.findUnique({ where: { id: Number(it.productId) } });
        if (!p) return res.status(400).json({ error: `Product ${it.productId} not found` });
        if (p.stock < it.quantity) return res.status(400).json({ error: `Product ${p.name} out of stock` });
        total += p.price * it.quantity;
    }

    const order = await prisma.order.create({
        data: {
            userId: req.user.userId,
            status: "pending",
            items: {
                create: items.map(i => ({
                    productId: i.productId,
                    quantity: i.quantity,
                }))
            }
        },
        include: { items: { include: { product: true } } }
    });

    // Generate and upload receipt
    const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
    const receiptHtml = generateReceiptHtml(order, user);
    const receiptUrl = await uploadReceiptToS3(receiptHtml, order.id);

    // Save receipt URL to order
    await prisma.order.update({
        where: { id: order.id },
        data: { receiptUrl }
    });

    // Send order email
    try {
        await sendEmail(user.email, orderEmail(order, user).subject, orderEmail(order, user).html);
    } catch (e) {
        console.error("Email error:", e);
    }

    // Send product purchase emails
    for (const item of order.items) {
        try {
            await sendEmail(user.email, productPurchaseEmail(item.product, user).subject, productPurchaseEmail(item.product, user).html);
        } catch (e) {
            console.error("Email error:", e);
        }
    }

    // reduce stock (simple)
    for (const it of items) {
        await prisma.product.update({
            where: { id: Number(it.productId) },
            data: { stock: { decrement: Number(it.quantity) } }
        });
    }

    res.json({ ...order, receiptUrl });
});

// admin update status
router.put("/:id/status", isAuthenticated, requireRole("admin"), async (req, res) => {
    const id = Number(req.params.id);
    const { status } = req.body;
    const updated = await prisma.order.update({ where: { id }, data: { status } });
    res.json(updated);
});

// get orders for user (customer) or all (admin)
router.get("/", isAuthenticated, async (req, res) => {
    const { role, userId } = req.user;
    if (role === "customer") {
        const orders = await prisma.order.findMany({ where: { userId }, include: { items: true } });
        return res.json(orders);
    } else {
        const orders = await prisma.order.findMany({ include: { items: true, user: true } });
        return res.json(orders);
    }
});

// get receipt (admin or customer)
router.get("/:id/receipt", isAuthenticated, async (req, res) => {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || !order.receiptUrl) return res.status(404).json({ error: "Receipt not found" });
    return res.redirect(order.receiptUrl);
});

// Download receipt as file (admin or customer)
router.get("/:id/receipt/download", isAuthenticated, async (req, res) => {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || !order.receiptUrl) return res.status(404).json({ error: "Receipt not found" });

    // Extract S3 key from URL
    const urlParts = order.receiptUrl.split("/");
    const key = urlParts.slice(3).join("/"); // receipts/xxxx.html

    try {
        const fileStream = await downloadReceiptFromS3(key);
        res.setHeader("Content-Disposition", `attachment; filename="receipt-${order.id}.html"`);
        res.setHeader("Content-Type", "text/html");
        fileStream.pipe(res);
    } catch (err) {
        res.status(500).json({ error: "Could not download receipt" });
    }
});

// View receipt (admin or customer)
router.get("/:id/receipt/view", isAuthenticated, async (req, res) => {
    const order = await prisma.order.findUnique({ where: { id: req.params.id } });
    if (!order || !order.receiptUrl) return res.status(404).json({ error: "Receipt not found" });

    // Extract S3 key from URL
    const urlParts = order.receiptUrl.split("/");
    const key = urlParts.slice(3).join("/"); // receipts/xxxx.html

    try {
        const fileStream = await downloadReceiptFromS3(key);
        res.setHeader("Content-Type", "text/html");
        fileStream.pipe(res);
    } catch (err) {
        res.status(500).json({ error: "Could not display receipt" });
    }
});

export default router;
