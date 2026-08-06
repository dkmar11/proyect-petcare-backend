const AppError = require("../../shared/errors/app-error");
const rabbitMQBus = require("../../shared/infrastructure/RabbitMQBus");

async function confirmBookingPayment(bookingId, { sagaId = null, paymentMethod, userId = null } = {}) {
  if (!bookingId) throw new AppError("El ID de la reserva es obligatorio.");
  if (!["ONLINE", "AT_LOCATION"].includes(paymentMethod)) throw new AppError("Método de pago no válido.");
  const paymentStatus = paymentMethod === "ONLINE" ? "PAID" : "PAY_AT_LOCATION_CONFIRMED";
  const payment = { bookingId, userId, paymentMethod, paymentStatus };
  await publishPaymentConfirmed(payment, sagaId);
  return payment;
}

async function publishPaymentConfirmed(payment, sagaId) {
  await rabbitMQBus.publish("petcare_events", "payment.confirmed", {
    eventName: "PaymentConfirmed",
    eventVersion: 1,
    occurredAt: new Date().toISOString(),
    bookingId: payment.bookingId,
    userId: payment.userId,
    paymentStatus: payment.paymentStatus,
    paymentMethod: payment.paymentMethod,
    sagaId,
  });
  console.log("[SAGA][BACKEND][PAYMENT] EVENT_PUBLISHED", { sagaId, bookingId: payment.bookingId, event: "PaymentConfirmed", paymentStatus: payment.paymentStatus });
}

module.exports = { confirmBookingPayment };
