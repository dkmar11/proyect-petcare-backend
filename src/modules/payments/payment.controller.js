const payments = require("./payment.service");

exports.confirm = async (req, res) => {
  const body = req.body || {};
  res.json(await payments.confirmBookingPayment(req.params.bookingId, {
    sagaId: req.get("x-saga-id"),
    paymentMethod: body.paymentMethod || req.get("x-payment-method"),
    userId: body.userId,
  }));
};
