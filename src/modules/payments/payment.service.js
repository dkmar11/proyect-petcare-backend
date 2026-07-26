const prisma = require("../../shared/infrastructure/persistence/prisma/client");
const AppError = require("../../shared/errors/app-error");
const rabbitMQBus = require("../../shared/infrastructure/RabbitMQBus");

async function confirmBookingPayment(bookingId) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError("Reserva no encontrada.", 404);
  if (!["ONLINE", "AT_LOCATION"].includes(booking.paymentMethod)) throw new AppError("Método de pago no válido.");
  const paymentStatus = booking.paymentMethod === "ONLINE" ? "PAID" : "PAY_AT_LOCATION_CONFIRMED";

  // La persistencia ocurre antes de publicar el evento para no anunciar un pago
  // que todavía no existe en la base de datos.
  const paidBooking = await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentStatus, status: booking.status === "PENDING" ? "CONFIRMED" : booking.status },
    include: { pet: true, provider: { include: { branch: true } }, promotion: true },
  });
  await rabbitMQBus.publish("petcare_events", "payment.confirmed", {
    eventName: "PaymentConfirmed",
    eventVersion: 1,
    occurredAt: new Date().toISOString(),
    bookingId: paidBooking.id,
    paymentStatus: paidBooking.paymentStatus,
    paymentMethod: paidBooking.paymentMethod,
  });
  console.log(`[confirmBookingPayment] PaymentConfirmed procesado: ${bookingId}`);
  return paidBooking;
}

module.exports = { confirmBookingPayment };
