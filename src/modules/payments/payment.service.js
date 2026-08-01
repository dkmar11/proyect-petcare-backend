const prisma = require("../../shared/infrastructure/persistence/prisma/client");
const AppError = require("../../shared/errors/app-error");
const rabbitMQBus = require("../../shared/infrastructure/RabbitMQBus");

async function confirmBookingPayment(bookingId, sagaId = null) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError("Reserva no encontrada.", 404);
  if (!["ONLINE", "AT_LOCATION"].includes(booking.paymentMethod)) throw new AppError("Método de pago no válido.");
  const paymentStatus = booking.paymentMethod === "ONLINE" ? "PAID" : "PAY_AT_LOCATION_CONFIRMED";
  if (booking.paymentStatus === paymentStatus) {
    if (sagaId) await publishPaymentConfirmed(booking, sagaId);
    return booking;
  }

  // La persistencia ocurre antes de publicar el evento para no anunciar un pago
  // que todavía no existe en la base de datos.
  const paidBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentStatus, status: booking.status === "PENDING" ? "CONFIRMED" : booking.status },
    include: { pet: true, provider: { include: { branch: true } }, promotion: true },
  });
  await publishPaymentConfirmed(paidBooking, sagaId);
  return paidBooking;
}

async function publishPaymentConfirmed(booking, sagaId) {
  await rabbitMQBus.publish("petcare_events", "payment.confirmed", {
    eventName: "PaymentConfirmed",
    eventVersion: 1,
    occurredAt: new Date().toISOString(),
    bookingId: booking.id,
    userId: booking.userId,
    paymentStatus: booking.paymentStatus,
    paymentMethod: booking.paymentMethod,
    sagaId,
  });
  console.log("[SAGA][BACKEND][PAYMENT] EVENT_PUBLISHED", { sagaId, bookingId: booking.id, event: "PaymentConfirmed", paymentStatus: booking.paymentStatus });
}

module.exports = { confirmBookingPayment };
