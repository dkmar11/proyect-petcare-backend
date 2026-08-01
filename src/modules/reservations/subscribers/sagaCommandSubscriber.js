const rabbitMQBus = require("../../../shared/infrastructure/RabbitMQBus");
const reservations = require("../reservation.service");

async function startSagaCommandSubscriber() {
  const queue = await rabbitMQBus.subscribe(
    "petcare_commands",
    "reservations_saga_commands_queue",
    "booking.create",
    async (command) => {
      if (command.commandName !== "BookingCreate" || !command.sagaId || !command.payload) {
        throw new Error("Comando BookingCreate inválido.");
      }
      try {
        const booking = await reservations.create(command.payload, { notify: false });
        if (booking.status === "REJECTED") {
          await rabbitMQBus.publish("petcare_events", "saga.failed", {
            eventName: "ReservationCreationFailed",
            eventVersion: 1,
            sagaId: command.sagaId,
            step: "RESERVATION",
            error: booking.rejectionReason || "La reserva fue rechazada.",
          });
          return;
        }
        await rabbitMQBus.publish("petcare_events", "reservation.created", {
          eventName: "ReservationCreated",
          eventVersion: 1,
          sagaId: command.sagaId,
          occurredAt: new Date().toISOString(),
          bookingId: booking.id,
          userId: booking.userId,
          paymentMethod: booking.paymentMethod,
        });
      } catch (error) {
        await rabbitMQBus.publish("petcare_events", "saga.failed", {
          eventName: "ReservationCreationFailed",
          eventVersion: 1,
          sagaId: command.sagaId,
          step: "RESERVATION",
          error: error.message,
        });
      }
    },
  );
  const compensationQueue = await rabbitMQBus.subscribe(
    "petcare_commands",
    "reservations_saga_compensation_queue",
    "reservation.compensate",
    async (command) => {
      if (command.commandName !== "ReservationCompensate" || !command.sagaId || !command.bookingId) {
        throw new Error("Comando ReservationCompensate inválido.");
      }
      const booking = await reservations.updateStatus(command.bookingId, {
        status: "REJECTED",
        rejectionReason: `Saga compensada: ${command.reason}`,
      });
      await rabbitMQBus.publish("petcare_events", "reservation.compensated", {
        eventName: "ReservationCompensated",
        eventVersion: 1,
        sagaId: command.sagaId,
        occurredAt: new Date().toISOString(),
        bookingId: booking.id,
      });
    },
  );
  console.log(`[RabbitMQ] Subscribers de reservas activos en ${queue} y ${compensationQueue}`);
}

module.exports = { startSagaCommandSubscriber };
