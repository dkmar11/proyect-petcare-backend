const { Router } = require("express");
const controller = require("./payment.controller");
const asyncHandler = require("../../shared/middlewares/async-handler");

const router = Router();

/**
 * @swagger
 * /api/bookings/{bookingId}/payment/confirm:
 *   post:
 *     summary: Confirm booking payment
 *     parameters:
 *       - in: path
 *         name: bookingId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Payment confirmed successfully.
 */
router.post("/bookings/:bookingId/payment/confirm", asyncHandler(controller.confirm));

module.exports = router;
