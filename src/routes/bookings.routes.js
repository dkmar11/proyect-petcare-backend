const { Router } = require("express");
const controller = require("../controllers/booking.controller");
const asyncHandler = require("../middlewares/async-handler");
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
 *               serviceId:
 *                 type: string
 *               petId:
 *                 type: string
 *               bookingDate:
 *                 type: string
 *                 format: date-time
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
 *                 enum: [PENDING, CONFIRMED, CANCELLED, COMPLETED]
 *     responses:
 *       200:
 *         description: Booking status updated successfully.
 *       404:
 *         description: Booking not found.
 */
router.patch("/bookings/:bookingId/status", asyncHandler(controller.updateStatus));

/**
 * @swagger
 * /api/bookings/{bookingId}/payment/confirm:
 *   post:
 *     summary: Confirm booking payment
 *     description: Confirms the payment for a specific booking.
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *         description: The booking's ID.
 *     responses:
 *       200:
 *         description: Payment confirmed successfully.
 *       404:
 *         description: Booking not found.
 */
router.post("/bookings/:bookingId/payment/confirm", asyncHandler(controller.confirmPayment));

module.exports = router;

