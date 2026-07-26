const notifications = require("./notification.service");
exports.list = async (req, res) => res.json(await notifications.listByUser(req.params.userId));
exports.markRead = async (req, res) => res.json(await notifications.markRead(req.params.notificationId));
exports.sendReminders = async (req, res) => res.json({ remindersSent: await notifications.sendReminders() });
