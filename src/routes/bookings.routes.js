const { Router } = require("express");
const controller = require("../controllers/booking.controller");
const asyncHandler = require("../middlewares/async-handler");
const router = Router();
router.post("/bookings", asyncHandler(controller.create));
router.get("/users/:userId/bookings", asyncHandler(controller.list));
router.patch("/bookings/:bookingId/status", asyncHandler(controller.updateStatus));
router.post("/bookings/:bookingId/payment/confirm", asyncHandler(controller.confirmPayment));
module.exports = router;
