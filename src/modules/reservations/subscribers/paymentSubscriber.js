const rabbitMQBus = require("../../../shared/infrastructure/RabbitMQBus");
const reservations = require("../reservation.service");

async function startPaymentSubscriber() {
  const queue = await rabbitMQBus.subscribe(
    "petcare_events",
    "reservations_payments_queue",
    "payment.confirmed",
    async (event) => {
      if (event.eventName !== "PaymentConfirmed" || !event.bookingId) {
        throw new Error("Evento PaymentConfirmed inválido: bookingId es obligatorio.");
      }
      const booking = await reservations.handlePaymentConfirmed(event);
      console.log(`[reservations] reservacion comfirmada: ${booking.id}`);
    },
  );
  console.log(`[RabbitMQ] Subscriber activo en ${queue}`);
}

module.exports = { startPaymentSubscriber };
