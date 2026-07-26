const express = require("express");
const cors = require("cors");
const errorHandler = require("./shared/middlewares/error-handler");
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./shared/config/swagger');

const healthRoutes = require("./shared/health/health.routes");
const userRoutes = require("./modules/users/user.routes");
const providerRoutes = require("./modules/users/provider.routes");
const petRoutes = require("./modules/pets/pet.routes");
const reservationRoutes = require("./modules/reservations/reservation.routes");
const notificationRoutes = require("./modules/reservations/notification.routes");
const promotionRoutes = require("./modules/reservations/promotion.routes");
const mapRoutes = require("./modules/reservations/map.routes");
const paymentRoutes = require("./modules/payments/payment.routes");

const app = express();

app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(cors({ origin: process.env.FRONTEND_URL || "http://localhost:5173" }));
app.use(express.json());
app.use("/uploads", express.static("uploads"));
app.use("/api", healthRoutes);
app.use("/api", userRoutes);
app.use("/api", providerRoutes);
app.use("/api", petRoutes);
app.use("/api", reservationRoutes);
app.use("/api", notificationRoutes);
app.use("/api", promotionRoutes);
app.use("/api", mapRoutes);
app.use("/api", paymentRoutes);

app.use(errorHandler);

module.exports = app;
