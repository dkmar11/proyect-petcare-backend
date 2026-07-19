const { Router } = require("express");
const { healthController } = require("../controllers/health.controller");
const userRoutes = require("./users.routes");
const petRoutes = require("./pets.routes");
const bookingRoutes = require("./bookings.routes");
const providerRoutes = require("./providers.routes");
const promotionRoutes = require("./promotions.routes");
const notificationRoutes = require("./notifications.routes");
const mapRoutes = require("./maps.routes");

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Checks the health of the API.
 *     responses:
 *       200:
 *         description: API is healthy.
 */
router.get("/health", healthController);

router.use(userRoutes, petRoutes, bookingRoutes, providerRoutes, promotionRoutes, notificationRoutes, mapRoutes);

module.exports = router;
