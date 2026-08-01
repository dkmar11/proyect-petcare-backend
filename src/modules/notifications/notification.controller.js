const notifications = require("./notification.service");

exports.list = async (req, res) => res.json(await notifications.listByUser(req.params.userId));
exports.create = async (req, res) => res.status(201).json(await notifications.create(req.body.userId, req.body.bookingId, req.body.type, req.body.title, req.body.message));
exports.markRead = async (req, res) => res.json(await notifications.markRead(req.params.notificationId));
exports.sendReminders = async (req, res) => res.json({ remindersSent: await notifications.sendReminders() });
