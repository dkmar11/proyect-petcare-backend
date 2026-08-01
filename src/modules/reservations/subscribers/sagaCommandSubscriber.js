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
      console.log("[SAGA][BACKEND][RESERVATION] COMMAND_START", { sagaId: command.sagaId, command: command.commandName, step: "RESERVATION" });
      try {
        const booking = await reservations.create(command.payload, { notify: false });
        if (booking.status === "REJECTED") {
          console.log("[SAGA][BACKEND][RESERVATION] STEP_FAILED", { sagaId: command.sagaId, step: "RESERVATION", reason: booking.rejectionReason });
          await rabbitMQBus.publish("petcare_events", "saga.failed", {
            eventName: "ReservationCreationFailed",
            eventVersion: 1,
            sagaId: command.sagaId,
            step: "RESERVATION",
            error: booking.rejectionReason || "La reserva fue rechazada.",
          });
          return;
        }
        console.log("[SAGA][BACKEND][RESERVATION] STEP_COMPLETED", { sagaId: command.sagaId, bookingId: booking.id, step: "RESERVATION" });
        await rabbitMQBus.publish("petcare_events", "reservation.created", {
          eventName: "ReservationCreated",
          eventVersion: 1,
          sagaId: command.sagaId,
          occurredAt: new Date().toISOString(),
          bookingId: booking.id,
          userId: booking.userId,
          paymentMethod: booking.paymentMethod,
        });
        console.log("[SAGA][BACKEND][RESERVATION] EVENT_PUBLISHED", { sagaId: command.sagaId, bookingId: booking.id, event: "ReservationCreated" });
      } catch (error) {
        console.error("[SAGA][BACKEND][RESERVATION] STEP_ERROR", { sagaId: command.sagaId, step: "RESERVATION", error: error.message });
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
      console.log("[SAGA][BACKEND][RESERVATION] COMPENSATION_START", { sagaId: command.sagaId, bookingId: command.bookingId, step: "RESERVATION" });
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
      console.log("[SAGA][BACKEND][RESERVATION] COMPENSATION_COMPLETED", { sagaId: command.sagaId, bookingId: booking.id });
    },
  );
  console.log(`[RabbitMQ] Subscribers de reservas activos en ${queue} y ${compensationQueue}`);
}

module.exports = { startSagaCommandSubscriber };
