const dotenv = require("dotenv");

dotenv.config();

const env = {
  port: Number(process.env.PORT) || 3000,
  databaseUrl: process.env.DATABASE_URL || "",
  cloudAmqpUrl: process.env.CLOUDAMQP_URL || "",
  rabbitMqNamespace: process.env.RABBITMQ_NAMESPACE || process.env.GCP_PROJECT_ID || process.env.NODE_ENV || "local",
  paymentFailureProbability: Math.min(1, Math.max(0, Number(process.env.PAYMENT_FAILURE_PROBABILITY) || 0)),
};

module.exports = env;
