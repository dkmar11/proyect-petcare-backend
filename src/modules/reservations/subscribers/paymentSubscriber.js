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
      console.log("[SAGA][BACKEND][RESERVATION] PAYMENT_EVENT_START", { sagaId: event.sagaId, bookingId: event.bookingId, event: event.eventName });
      const booking = await reservations.handlePaymentConfirmed(event);
      console.log("[SAGA][BACKEND][RESERVATION] PAYMENT_EVENT_COMPLETED", { sagaId: event.sagaId, bookingId: booking.id, status: booking.status });
    },
  );
  console.log(`[RabbitMQ] Subscriber activo en ${queue}`);
}

module.exports = { startPaymentSubscriber };
