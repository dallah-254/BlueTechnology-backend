import express from "express";
import bookingController from "../controllers/bookingController.js";

const router = express.Router();

/**
 * @swagger
 * /bookings:
 *   post:
 *     summary: Book a service (customer only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - serviceId
 *               - scheduledAt
 *             properties:
 *               serviceId:
 *                 type: integer
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               notes:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking created
 *       401:
 *         description: Unauthorized
 */

/**
 * @swagger
 * /bookings/{id}/status:
 *   put:
 *     summary: Update booking status (worker/admin only)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking status updated
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Booking not found
 */

/**
 * @swagger
 * /bookings:
 *   get:
 *     summary: Get bookings for current user (customer) or all (worker/admin)
 *     tags: [Bookings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of bookings
 *       401:
 *         description: Unauthorized
 */
router.use("/", bookingController);

export default router;