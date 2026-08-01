const rabbitMQBus = require("../../shared/infrastructure/RabbitMQBus");
const payments = require("./payment.service");

async function startSagaCommandSubscriber() {
  const queue = await rabbitMQBus.subscribe(
    "petcare_commands",
    "payments_saga_commands_queue",
    "payment.requested",
    async (command) => {
      if (command.commandName !== "PaymentRequested" || !command.sagaId || !command.bookingId) {
        throw new Error("Comando PaymentRequested inválido.");
      }
      try {
        await payments.confirmBookingPayment(command.bookingId, command.sagaId);
      } catch (error) {
        await rabbitMQBus.publish("petcare_events", "saga.failed", {
          eventName: "PaymentFailed",
          eventVersion: 1,
          sagaId: command.sagaId,
          step: "PAYMENT",
          bookingId: command.bookingId,
          error: error.message,
        });
      }
    },
  );
  console.log(`[RabbitMQ] Subscriber de comandos de pago activo en ${queue}`);
}

module.exports = { startSagaCommandSubscriber };
