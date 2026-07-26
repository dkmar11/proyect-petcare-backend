const prisma = require("../../shared/infrastructure/persistence/prisma/client");
const AppError = require("../../shared/errors/app-error");

async function confirmBookingPayment(bookingId) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new AppError("Reserva no encontrada.", 404);
  if (booking.paymentMethod !== "ONLINE") throw new AppError("Esta reserva se paga en el local.");

  // TODO: Integrate the external payment gateway before marking the payment as PAID.
  // TODO: Refactor to use Domain Events so reservations/notifications react to PaymentConfirmed.
  return prisma.booking.update({
    where: { id: bookingId },
    data: { paymentStatus: "PAID" },
    include: { pet: true, provider: { include: { branch: true } }, promotion: true },
  });
}

module.exports = { confirmBookingPayment };
