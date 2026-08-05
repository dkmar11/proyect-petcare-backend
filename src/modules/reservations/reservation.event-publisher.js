const rabbitMQBus = require("../../shared/infrastructure/RabbitMQBus");

async function publishReservationCreated(booking, sagaId) {
  await rabbitMQBus.publish("petcare_events", "reservation.created", {
    eventName: "ReservationCreated",
    eventVersion: 1,
    sagaId,
    occurredAt: new Date().toISOString(),
    bookingId: booking.id,
    userId: booking.userId,
    paymentMethod: booking.paymentMethod,
  });

  console.log("[SAGA][BACKEND][RESERVATION] EVENT_PUBLISHED", {
    sagaId,
    bookingId: booking.id,
    event: "ReservationCreated",
  });
}

module.exports = { publishReservationCreated };
