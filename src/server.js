const app = require("./app");
const env = require("./shared/config/env");
const rabbitMQBus = require("./shared/infrastructure/RabbitMQBus");
const { startPaymentSubscriber } = require("./modules/reservations/subscribers/paymentSubscriber");
const { startSagaCommandSubscriber: startReservationSagaCommands } = require("./modules/reservations/subscribers/sagaCommandSubscriber");
const { startSagaCommandSubscriber: startPaymentSagaCommands } = require("./modules/payments/sagaCommandSubscriber");
const { startSagaCommandSubscriber: startNotificationSagaCommands } = require("./modules/notifications/sagaCommandSubscriber");

async function bootstrap() {
  const server = app.listen(env.port, () => console.log(`Server running on port ${env.port}`));

  const shutdown = async () => {
    server.close();
    await rabbitMQBus.close();
    process.exit(0);
  };
  process.once("SIGINT", shutdown);
  process.once("SIGTERM", shutdown);

  try {
    await rabbitMQBus.initialize();
    await startPaymentSubscriber();
    await startReservationSagaCommands();
    await startPaymentSagaCommands();
    await startNotificationSagaCommands();
  } catch (error) {
    console.error("No se pudo iniciar RabbitMQ; las rutas HTTP seguirán disponibles:", error.message);
  }
}

bootstrap();
