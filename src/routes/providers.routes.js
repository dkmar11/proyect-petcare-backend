const { Router } = require("express");
const controller = require("../controllers/provider.controller");
const asyncHandler = require("../middlewares/async-handler");
const router = Router();

/**
 * @swagger
 * /api/providers:
 *   get:
 *     summary: List all providers
 *     description: Retrieves a list of all service providers.
 *     responses:
 *       200:
 *         description: A list of providers.
 *       500:
 *         description: Internal server error.
 */
router.get("/providers", asyncHandler(controller.list));

module.exports = router;

