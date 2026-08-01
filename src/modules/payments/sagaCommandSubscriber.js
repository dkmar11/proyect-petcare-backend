const rabbitMQBus = require("../../shared/infrastructure/RabbitMQBus");
const payments = require("./payment.service");
const env = require("../../shared/config/env");

async function startSagaCommandSubscriber() {
  const queue = await rabbitMQBus.subscribe(
    "petcare_commands",
    "payments_saga_commands_queue",
    "payment.requested",
    async (command) => {
      if (command.commandName !== "PaymentRequested" || !command.sagaId || !command.bookingId) {
        throw new Error("Comando PaymentRequested inválido.");
      }
      console.log("[SAGA][BACKEND][PAYMENT] COMMAND_START", { sagaId: command.sagaId, bookingId: command.bookingId, command: command.commandName, step: "PAYMENT" });
      try {
        if (Math.random() < env.paymentFailureProbability) {
          throw new Error("Fallo simulado del servicio de pagos.");
        }
        await payments.confirmBookingPayment(command.bookingId, command.sagaId);
        console.log("[SAGA][BACKEND][PAYMENT] STEP_COMPLETED", { sagaId: command.sagaId, bookingId: command.bookingId, step: "PAYMENT" });
      } catch (error) {
        console.error("[SAGA][BACKEND][PAYMENT] STEP_ERROR", { sagaId: command.sagaId, bookingId: command.bookingId, step: "PAYMENT", error: error.message });
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
