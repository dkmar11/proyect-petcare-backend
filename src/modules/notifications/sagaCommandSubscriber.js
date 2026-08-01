const rabbitMQBus = require("../../shared/infrastructure/RabbitMQBus");
const notifications = require("./notification.service");

async function startSagaCommandSubscriber() {
  const queue = await rabbitMQBus.subscribe(
    "petcare_commands",
    "notifications_saga_commands_queue",
    "notification.requested",
    async (command) => {
      if (command.commandName !== "NotificationRequested" || !command.sagaId || !command.userId || !command.bookingId) {
        throw new Error("Comando NotificationRequested inválido.");
      }
      console.log("[SAGA][BACKEND][NOTIFICATION] COMMAND_START", { sagaId: command.sagaId, bookingId: command.bookingId, command: command.commandName, step: "NOTIFICATION" });
      try {
        await notifications.create(command.userId, command.bookingId, command.type, command.title, command.message);
        console.log("[SAGA][BACKEND][NOTIFICATION] STEP_COMPLETED", { sagaId: command.sagaId, bookingId: command.bookingId, step: "NOTIFICATION" });
        await rabbitMQBus.publish("petcare_events", "notification.sent", {
          eventName: "NotificationSent",
          eventVersion: 1,
          sagaId: command.sagaId,
          occurredAt: new Date().toISOString(),
          bookingId: command.bookingId,
        });
        console.log("[SAGA][BACKEND][NOTIFICATION] EVENT_PUBLISHED", { sagaId: command.sagaId, bookingId: command.bookingId, event: "NotificationSent" });
      } catch (error) {
        console.error("[SAGA][BACKEND][NOTIFICATION] STEP_ERROR", { sagaId: command.sagaId, bookingId: command.bookingId, step: "NOTIFICATION", error: error.message });
        await rabbitMQBus.publish("petcare_events", "saga.failed", {
          eventName: "NotificationFailed",
          eventVersion: 1,
          sagaId: command.sagaId,
          step: "NOTIFICATION",
          bookingId: command.bookingId,
          error: error.message,
        });
      }
    },
  );
  console.log(`[RabbitMQ] Subscriber de comandos de notificación activo en ${queue}`);
}

module.exports = { startSagaCommandSubscriber };
