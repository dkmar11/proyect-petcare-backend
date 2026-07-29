const prisma = require("../../shared/infrastructure/persistence/prisma/client");
const repository = require("./infrastructure/notification.repository");

const statusMessages = {
  CONFIRMED: ["Reserva confirmada", "Tu cita fue confirmada por el proveedor."],
  IN_PROGRESS: ["Servicio en curso", "El proveedor ya esta atendiendo a tu mascota."],
  COMPLETED: ["Servicio completado", "El servicio fue completado. Gracias por confiar en PetCare!"],
  REJECTED: ["Reserva no aprobada", "El proveedor no pudo aprobar esta reserva. Revisa el motivo en tu cita."],
};

const create = (userId, bookingId, type, title, message) => repository.create({ userId, bookingId, type, title, message });
const listByUser = (userId) => prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
const markRead = (id) => prisma.notification.update({ where: { id }, data: { readAt: new Date() } });

async function sendReminders() {
  const from = new Date();
  const until = new Date(from.getTime() + 24 * 60 * 60 * 1000);
  const bookings = await prisma.booking.findMany({ where: { status: "CONFIRMED", scheduledAt: { gte: from, lte: until } }, include: { pet: true } });
  let sent = 0;
  for (const booking of bookings) {
    const exists = await prisma.notification.findFirst({ where: { bookingId: booking.id, type: "APPOINTMENT_REMINDER" } });
    if (!exists) {
      await create(booking.userId, booking.id, "APPOINTMENT_REMINDER", "Recordatorio de cita", `Manana tienes ${booking.serviceType.toLowerCase()} para ${booking.pet.name}.`);
      sent += 1;
    }
  }
  return sent;
}

module.exports = { create, listByUser, markRead, sendReminders, statusMessages };
