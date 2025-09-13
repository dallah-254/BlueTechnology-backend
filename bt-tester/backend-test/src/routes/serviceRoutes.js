import express from "express";
import serviceController from "../controllers/serviceController.js";

const router = express.Router();

/**
 * @swagger
 * /services:
 *   get:
 *     summary: Get all services
 *     tags: [Services]
 *     responses:
 *       200:
 *         description: List of services
 */

/**
 * @swagger
 * /services:
 *   post:
 *     summary: Create a new service (admin only)
 *     tags: [Services]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               durationMin:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Service created
 *       401:
 *         description: Unauthorized
 */
router.use("/", serviceController);

export default router;