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
      try {
        await notifications.create(command.userId, command.bookingId, command.type, command.title, command.message);
        await rabbitMQBus.publish("petcare_events", "notification.sent", {
          eventName: "NotificationSent",
          eventVersion: 1,
          sagaId: command.sagaId,
          occurredAt: new Date().toISOString(),
          bookingId: command.bookingId,
        });
      } catch (error) {
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
