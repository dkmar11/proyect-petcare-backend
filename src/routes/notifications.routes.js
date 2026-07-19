const { Router } = require("express");
const controller = require("../controllers/notification.controller");
const asyncHandler = require("../middlewares/async-handler");
const router = Router();
router.get("/users/:userId/notifications", asyncHandler(controller.list));
router.patch("/notifications/:notificationId/read", asyncHandler(controller.markRead));
router.post("/maintenance/appointment-reminders", asyncHandler(controller.sendReminders));
module.exports = router;
