const rabbitMQBus = require("../../shared/infrastructure/RabbitMQBus");
const notifications = require("./notification.service");

async function startBookingEventSubscriber() {
  const statusQueue = await rabbitMQBus.subscribe(
    "petcare_events",
    "notifications_booking_status_events_queue",
    "booking.status.changed",
    async (event) => {
      if (event.eventName !== "BookingStatusChanged" || !event.bookingId || !event.userId) {
        throw new Error("Evento BookingStatusChanged inválido.");
      }

      if (event.status === "PENDING") {
        await notifications.createIfMissing({
          userId: event.userId,
          bookingId: event.bookingId,
          type: "BOOKING_REQUESTED",
          title: "Solicitud recibida",
          message: "Tu solicitud fue enviada al proveedor. Te notificaremos cuando sea confirmada.",
        });
        return;
      }

      const [title, message] = notifications.statusMessages[event.status] || [];
      if (!title) throw new Error(`Estado de reserva no soportado: ${event.status}`);
      await notifications.createIfMissing({
        userId: event.userId,
        bookingId: event.bookingId,
        type: `BOOKING_${event.status}`,
        title,
        message: event.status === "REJECTED" ? `${message} Motivo: ${event.rejectionReason}` : message,
      });
    },
  );

  const compensationQueue = await rabbitMQBus.subscribe(
    "petcare_events",
    "notifications_reservation_compensations_queue",
    "reservation.compensated",
    async (event) => {
      if (event.eventName !== "ReservationCompensated" || !event.bookingId) {
        throw new Error("Evento ReservationCompensated inválido.");
      }
      await require("../../shared/infrastructure/persistence/prisma/client").notification.deleteMany({
        where: { bookingId: event.bookingId },
      });
    },
  );

  console.log("[RabbitMQ] Subscribers de eventos de reservas activos", { statusQueue, compensationQueue });
}

module.exports = { startBookingEventSubscriber };
