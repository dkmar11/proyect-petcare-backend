const amqp = require("amqplib");

/**
 * Shared asynchronous event bus. A single channel is reused by the process;
 * queue names are namespaced to prevent staging and production collisions.
 */
class RabbitMQBus {
  connection = null;
  channel = null;
  initialization = null;

  async initialize() {
    if (this.channel) return this.channel;
    if (this.initialization) return this.initialization;
    const url = process.env.CLOUDAMQP_URL;
    if (!url) throw new Error("CLOUDAMQP_URL no está configurada en .env");

    this.initialization = amqp.connect(url).then(async (connection) => {
      this.connection = connection;
      connection.on("error", (error) => console.error("RabbitMQ connection error:", error.message));
      connection.on("close", () => { this.connection = null; this.channel = null; this.initialization = null; });
      this.channel = await connection.createChannel();
      return this.channel;
    }).catch((error) => {
      this.initialization = null;
      this.connection = null;
      this.channel = null;
      throw error;
    });
    return this.initialization;
  }

  queueName(queueName) {
    const namespace = process.env.RABBITMQ_NAMESPACE || process.env.GCP_PROJECT_ID || process.env.NODE_ENV || "local";
    return `petcare.${namespace}.${queueName}`;
  }

  async publish(exchange, routingKey, message) {
    const channel = await this.initialize();
    await channel.assertExchange(exchange, "topic", { durable: true });
    return channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
      contentType: "application/json",
      persistent: true,
      timestamp: Date.now(),
    });
  }

  async subscribe(exchange, queue, routingKey, callback) {
    const channel = await this.initialize();
    await channel.assertExchange(exchange, "topic", { durable: true });
    const scopedQueue = this.queueName(queue);
    await channel.assertQueue(scopedQueue, { durable: true });
    await channel.bindQueue(scopedQueue, exchange, routingKey);
    await channel.consume(scopedQueue, async (message) => {
      if (!message) return;
      try {
        const payload = JSON.parse(message.content.toString());
        await callback(payload, message);
        channel.ack(message);
      } catch (error) {
        console.error(`Error procesando ${exchange}:${routingKey}:`, error);
        channel.nack(message, false, true);
      }
    });
    return scopedQueue;
  }

  async close() {
    if (this.connection) await this.connection.close();
    this.connection = null;
    this.channel = null;
    this.initialization = null;
  }
}

module.exports = new RabbitMQBus();
