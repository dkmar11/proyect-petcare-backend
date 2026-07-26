const bookings = require("./reservation.service");
exports.create = async (req, res) => res.status(201).json(await bookings.create(req.body));
exports.list = async (req, res) => res.json(await bookings.listByUser(req.params.userId));
exports.updateStatus = async (req, res) => res.json(await bookings.updateStatus(req.params.bookingId, req.body));
exports.listByProvider = async (req, res) => res.json(await bookings.listByProvider(req.params.providerId));
