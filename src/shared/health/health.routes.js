const { Router } = require("express");
const { healthController } = require("./health.controller");

const router = Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Health check
 *     responses:
 *       200:
 *         description: API is healthy.
 */
router.get("/health", healthController);

module.exports = router;
