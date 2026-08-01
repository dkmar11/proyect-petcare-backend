const payments = require("./payment.service");

exports.confirm = async (req, res) => {
  res.json(await payments.confirmBookingPayment(req.params.bookingId, req.get("x-saga-id")));
};
