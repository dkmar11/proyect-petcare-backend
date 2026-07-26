const { Router } = require("express");
const controller = require("./reservation.controller");
const asyncHandler = require("../../shared/middlewares/async-handler");
const router = Router();

/**
 * @swagger
 * /api/bookings:
 *   post:
 *     summary: Create a new booking
 *     description: Creates a new booking for a service.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               userId:
 *                 type: string
 *               petId:
 *                 type: string
 *               providerId:
 *                 type: string
 *               serviceType:
 *                 type: string
 *               serviceMode:
 *                 type: string
 *               promotionCode:
 *                 type: string
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               scheduledAt:
 *                 type: string
 *                 format: date-time
 *               paymentMethod:
 *                 type: string
 *     responses:
 *       201:
 *         description: Booking created successfully.
 *       400:
 *         description: Bad request.
 */
router.post("/bookings", asyncHandler(controller.create));

/**
 * @swagger
 * /api/users/{userId}/bookings:
 *   get:
 *     summary: List user's bookings
 *     description: Retrieves a list of bookings for a specific user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's ID.
 *     responses:
 *       200:
 *         description: A list of bookings.
 *       404:
 *         description: User not found.
 */
router.get("/users/:userId/bookings", asyncHandler(controller.list));

/**
 * @swagger
 * /api/bookings/{bookingId}/status:
 *   patch:
 *     summary: Update booking status
 *     description: Updates the status of a specific booking.
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The booking's ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [CONFIRMED, IN_PROGRESS, COMPLETED, REJECTED]
 *               rejectionReason:
 *                 type: string
 *     responses:
 *       200:
 *         description: Booking status updated successfully.
 *       404:
 *         description: Booking not found.
 */
router.patch("/bookings/:bookingId/status", asyncHandler(controller.updateStatus));

router.get("/providers/:providerId/bookings", asyncHandler(controller.listByProvider));

module.exports = router;
