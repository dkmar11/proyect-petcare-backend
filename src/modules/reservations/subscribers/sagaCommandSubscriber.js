const rabbitMQBus = require("../../../shared/infrastructure/RabbitMQBus");
const reservations = require("../reservation.service");

async function startReservationCompensationSubscriber() {
  const queue = await rabbitMQBus.subscribe(
    "petcare_commands",
    "reservations_saga_compensation_queue",
    "reservation.compensate",
    async (command) => {
      if (command.commandName !== "ReservationCompensate" || !command.sagaId || !command.bookingId) {
        throw new Error("Comando ReservationCompensate inválido.");
      }
      console.log("[SAGA][BACKEND][RESERVATION] COMPENSATION_START", { sagaId: command.sagaId, bookingId: command.bookingId, step: "RESERVATION" });
      const booking = await reservations.compensate(command.bookingId);
      await rabbitMQBus.publish("petcare_events", "reservation.compensated", {
        eventName: "ReservationCompensated",
        eventVersion: 1,
        sagaId: command.sagaId,
        occurredAt: new Date().toISOString(),
        bookingId: command.bookingId,
        deleted: Boolean(booking),
      });
      console.log("[SAGA][BACKEND][RESERVATION] COMPENSATION_COMPLETED", { sagaId: command.sagaId, bookingId: command.bookingId, deleted: Boolean(booking) });
    },
  );
  console.log(`[RabbitMQ] Subscriber de compensación de reservas activo en ${queue}`);
}

module.exports = { startReservationCompensationSubscriber };
