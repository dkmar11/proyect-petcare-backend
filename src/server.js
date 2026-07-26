const app = require("./app");
const env = require("./shared/config/env");
const rabbitMQBus = require("./shared/infrastructure/RabbitMQBus");
const { startPaymentSubscriber } = require("./modules/reservations/subscribers/paymentSubscriber");

async function bootstrap() {
  try {
    await rabbitMQBus.initialize();
    await startPaymentSubscriber();
    const server = app.listen(env.port, () => console.log(`Server running on port ${env.port}`));
    const shutdown = async () => { server.close(); await rabbitMQBus.close(); process.exit(0); };
    process.once("SIGINT", shutdown);
    process.once("SIGTERM", shutdown);
  } catch (error) {
    console.error("No se pudo iniciar RabbitMQ:", error.message);
    process.exitCode = 1;
  }
}

bootstrap();
