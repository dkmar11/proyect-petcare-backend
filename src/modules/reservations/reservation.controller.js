const { randomUUID } = require("node:crypto");
const bookings = require("./reservation.service");
const { publishReservationCreated } = require("./reservation.event-publisher");

exports.create = async (req, res) => {
  const booking = await bookings.create(req.body, { notify: false });

  // La reserva se persiste sincrónicamente. Solo una reserva aceptada inicia
  // los pasos asíncronos de pago y notificación.
  if (booking.status === "REJECTED") return res.status(201).json({ ...booking, sagaId: null });

  const sagaId = randomUUID();
  try {
    await publishReservationCreated(booking, sagaId);
  } catch (error) {
    // Evita dejar una reserva huérfana si RabbitMQ no acepta el evento inicial.
    await bookings.compensate(booking.id);
    throw error;
  }

  return res.status(201).json({ ...booking, sagaId });
};
exports.list = async (req, res) => res.json(await bookings.listByUser(req.params.userId));
exports.updateStatus = async (req, res) => res.json(await bookings.updateStatus(req.params.bookingId, req.body));
exports.listByProvider = async (req, res) => res.json(await bookings.listByProvider(req.params.providerId));
