const app = require("./app");
const env = require("./shared/config/env");
const rabbitMQBus = require("./shared/infrastructure/RabbitMQBus");
const { startSagaCommandSubscriber: startPaymentSagaCommands } = require("./modules/payments/sagaCommandSubscriber");
const { startSagaCommandSubscriber: startNotificationSagaCommands } = require("./modules/notifications/sagaCommandSubscriber");
const { startBookingEventSubscriber } = require("./modules/notifications/bookingEventSubscriber");

async function bootstrap() {
  const server = app.listen(env.port, () => console.log("[SAGA][BACKEND] HTTP_READY", { port: env.port }));

  const shutdown = async () => {
    server.close();
    await rabbitMQBus.close();
    process.exit(0);
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  try {
    console.log("[SAGA][BACKEND] SUBSCRIBERS_START", { namespace: process.env.RABBITMQ_NAMESPACE || "local" });
    await rabbitMQBus.initialize();
    await startPaymentSagaCommands();
    await startNotificationSagaCommands();
    await startBookingEventSubscriber();
    console.log("[SAGA][BACKEND] SUBSCRIBERS_READY");
  } catch (error) {
    console.error("[SAGA][BACKEND] SUBSCRIBERS_START_FAILED", { error: error.message });
  }
}

bootstrap();
