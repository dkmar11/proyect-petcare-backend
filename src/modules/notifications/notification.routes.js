const { Router } = require("express");
const controller = require("./notification.controller");
const asyncHandler = require("../../shared/middlewares/async-handler");
const router = Router();

router.post("/notifications", asyncHandler(controller.create));

/**
 * @swagger
 * /api/users/{userId}/notifications:
 *   get:
 *     summary: List user's notifications
 *     description: Retrieves a list of notifications for a specific user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's ID.
 *     responses:
 *       200:
 *         description: A list of notifications.
 *       404:
 *         description: User not found.
 */
router.get("/users/:userId/notifications", asyncHandler(controller.list));

/**
 * @swagger
 * /api/notifications/{notificationId}/read:
 *   patch:
 *     summary: Mark notification as read
 *     description: Marks a specific notification as read.
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         required: true
 *         schema:
 *           type: string
 *         description: The notification's ID.
 *     responses:
 *       200:
 *         description: Notification marked as read successfully.
 *       404:
 *         description: Notification not found.
 */
router.patch("/notifications/:notificationId/read", asyncHandler(controller.markRead));

module.exports = router;
