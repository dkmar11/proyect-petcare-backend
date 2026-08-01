const prisma = require("../../shared/infrastructure/persistence/prisma/client");
const AppError = require("../../shared/errors/app-error");
const { validateBookingInput, validateProviderCapability, requiresVaccine } = require("./domain/booking.rules");
const { createMapUrl } = require("./infrastructure/google-maps.service");
const promotions = require("./promotion.service");
const notifications = require("../notifications/notification.service");

const include = { pet: true, provider: { include: { branch: true } }, promotion: true };
async function create(input, { notify = true } = {}) {
  validateBookingInput(input);
  const [pet, provider] = await Promise.all([prisma.pet.findFirst({ where: { id: input.petId, ownerId: input.userId } }), prisma.provider.findUnique({ where: { id: input.providerId }, include: { branch: true } })]);
  if (!pet) throw new AppError("La mascota no pertenece al usuario.", 404);
  if (!provider) throw new AppError("Proveedor no encontrado.", 404);
  validateProviderCapability(provider, input.serviceMode, input.address, input.latitude, input.longitude);
  const vaccineRequired = requiresVaccine(input.serviceType);
  const rejected = vaccineRequired && !pet.vaccinationRecord;
  const promotion = input.promotionCode ? await promotions.findApplicable(input.promotionCode, provider) : null;
  const { promotionCode, ...bookingInput } = input;
  const booking = await prisma.booking.create({
    data: { ...bookingInput, scheduledAt: new Date(input.scheduledAt), latitude: input.latitude == null ? null : Number(input.latitude), longitude: input.longitude == null ? null : Number(input.longitude), mapUrl: createMapUrl(input.address, input.latitude, input.longitude), requiresVaccine: vaccineRequired, status: rejected ? "REJECTED" : "PENDING", rejectionReason: rejected ? "Este servicio requiere un registro de vacunación vigente." : null, paymentStatus: input.paymentMethod === "ONLINE" ? "PENDING" : "PAY_AT_LOCATION", promotionId: promotion?.id },
    include,
  });
  if (notify) {
    await notifications.create(input.userId, booking.id, rejected ? "BOOKING_REJECTED" : "BOOKING_REQUESTED", rejected ? "Reserva rechazada" : "Solicitud recibida", booking.rejectionReason || "Tu solicitud fue enviada al proveedor. Te notificaremos cuando sea confirmada.");
  }
  return booking;
}
const listByUser = (userId) => prisma.booking.findMany({ where: { userId }, include, orderBy: { scheduledAt: "asc" } });
const listByProvider = (providerId) => prisma.booking.findMany({ where: { providerId }, include: { pet: true, user: true, promotion: true }, orderBy: { scheduledAt: "asc" } });
async function updateStatus(id, { status, rejectionReason, paymentStatus }) {
  if (!Object.keys(notifications.statusMessages).includes(status)) throw new AppError("Estado no permitido.");
  if (status === "REJECTED" && !rejectionReason) throw new AppError("Indica un motivo de rechazo.");
  const booking = await prisma.booking.update({ where: { id }, data: { status, rejectionReason: status === "REJECTED" ? rejectionReason : null, ...(paymentStatus ? { paymentStatus } : {}) }, include });
  const [title, message] = notifications.statusMessages[status];
  await notifications.create(booking.userId, booking.id, `BOOKING_${status}`, title, status === "REJECTED" ? `${message} Motivo: ${rejectionReason}` : message);
  return booking;
}
async function handlePaymentConfirmed({ bookingId, paymentStatus = "PAID", sagaId }) {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId }, include });
  if (!booking) throw new AppError(`Reserva ${bookingId} no encontrada para PaymentConfirmed.`, 404);
  if (["PAID", "PAY_AT_LOCATION_CONFIRMED"].includes(booking.paymentStatus)) return booking;
  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: { paymentStatus, status: booking.status === "PENDING" ? "CONFIRMED" : booking.status },
    include,
  });
  if (!sagaId) {
    await notifications.create(updated.userId, updated.id, "PAYMENT_CONFIRMED", "Pago confirmado", "Tu pago online fue confirmado y tu reserva está lista para ser atendida.");
  }
  return updated;
}

async function compensate(bookingId) {
  return prisma.$transaction(async (tx) => {
    const booking = await tx.booking.findUnique({ where: { id: bookingId } });
    if (!booking) return null;
    await tx.notification.deleteMany({ where: { bookingId } });
    await tx.booking.delete({ where: { id: bookingId } });
    return booking;
  });
}

module.exports = { create, listByUser, listByProvider, updateStatus, handlePaymentConfirmed, compensate };
