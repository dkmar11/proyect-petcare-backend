const prisma = require("../../shared/infrastructure/persistence/prisma/client");
const repository = require("./infrastructure/notification.repository");

const statusMessages = {
  CONFIRMED: ["Reserva confirmada", "Tu cita fue confirmada por el proveedor."],
  IN_PROGRESS: ["Servicio en curso", "El proveedor ya esta atendiendo a tu mascota."],
  COMPLETED: ["Servicio completado", "El servicio fue completado. Gracias por confiar en PetCare!"],
  REJECTED: ["Reserva no aprobada", "El proveedor no pudo aprobar esta reserva. Revisa el motivo en tu cita."],
};

const create = (userId, bookingId, type, title, message) => repository.create({ userId, bookingId, type, title, message });
async function createIfMissing({ userId, bookingId, type, title, message }) {
  const existing = await prisma.notification.findFirst({ where: { bookingId, type } });
  return existing || create(userId, bookingId, type, title, message);
}
const listByUser = (userId) => prisma.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
const markRead = (id) => prisma.notification.update({ where: { id }, data: { readAt: new Date() } });

module.exports = { create, createIfMissing, listByUser, markRead, statusMessages };
