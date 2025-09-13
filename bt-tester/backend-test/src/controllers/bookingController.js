import express from "express";
import pkg from "@prisma/client";
const { PrismaClient } = pkg;
const prisma = new PrismaClient();
import { isAuthenticated } from "../middleware/authMiddleware.js";
import { requireRole } from "../middleware/roleMiddleware.js";
import { generateBookingReceiptHtml } from "../utils/receipt.js";
import { uploadReceiptToS3, downloadReceiptFromS3 } from "../utils/s3.js";
import { sendEmail, bookingEmail } from "../utils/email.js";

const router = express.Router();

// Customer books service
router.post("/", isAuthenticated, requireRole("customer"), async (req, res) => {
  const { serviceId, scheduledAt, notes } = req.body;
  const service = await prisma.service.findUnique({ where: { id: serviceId } });
  if (!service) return res.status(400).json({ error: "Service not found" });

  const booking = await prisma.booking.create({
    data: {
      userId: req.user.userId,
      serviceId,
      date: new Date(scheduledAt),
      status: "scheduled",
      notes
    }
  });

  // Generate and upload receipt
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  const receiptHtml = generateBookingReceiptHtml(booking, user, service);
  const receiptUrl = await uploadReceiptToS3(receiptHtml, booking.id);

  // Save receipt URL to booking
  await prisma.booking.update({
    where: { id: booking.id },
    data: { receiptUrl }
  });

  // Send booking email
  try {
    await sendEmail(user.email, bookingEmail(booking, user, service).subject, bookingEmail(booking, user, service).html);
  } catch (e) {
    console.error("Email error:", e);
  }

  res.json({ ...booking, receiptUrl });
});

// Worker or admin can update status
router.put("/:id/status", isAuthenticated, requireRole("worker", "admin"), async (req, res) => {
  const id = Number(req.params.id);
  const { status } = req.body;
  const updated = await prisma.booking.update({ where: { id }, data: { status } });
  res.json(updated);
});

// List bookings for current user (customer or worker/admin sees all)
router.get("/", isAuthenticated, async (req, res) => {
  const { role, userId } = req.user;
  if (role === "customer") {
    const bookings = await prisma.booking.findMany({ where: { userId } });
    return res.json(bookings);
  } else {
    const bookings = await prisma.booking.findMany({ include: { user: true, service: true } });
    return res.json(bookings);
  }
});

// Add routes to view/download receipt
router.get("/:id/receipt/download", isAuthenticated, async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking || !booking.receiptUrl) return res.status(404).json({ error: "Receipt not found" });

  const urlParts = booking.receiptUrl.split("/");
  const key = urlParts.slice(3).join("/");

  try {
    const fileStream = await downloadReceiptFromS3(key);
    res.setHeader("Content-Disposition", `attachment; filename="booking-receipt-${booking.id}.html"`);
    res.setHeader("Content-Type", "text/html");
    fileStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Could not download receipt" });
  }
});

router.get("/:id/receipt/view", isAuthenticated, async (req, res) => {
  const booking = await prisma.booking.findUnique({ where: { id: req.params.id } });
  if (!booking || !booking.receiptUrl) return res.status(404).json({ error: "Receipt not found" });

  const urlParts = booking.receiptUrl.split("/");
  const key = urlParts.slice(3).join("/");

  try {
    const fileStream = await downloadReceiptFromS3(key);
    res.setHeader("Content-Type", "text/html");
    fileStream.pipe(res);
  } catch (err) {
    res.status(500).json({ error: "Could not display receipt" });
  }
});

export default router;
