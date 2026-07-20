const { Router } = require("express");
const controller = require("../controllers/promotion.controller");
const asyncHandler = require("../middlewares/async-handler");
const router = Router();

/**
 * @swagger
 * /api/promotions:
 *   get:
 *     summary: List all promotions
 *     description: Retrieves a list of all available promotions, optionally filtered by branch or provider.
 *     parameters:
 *       - in: query
 *         name: branchId
 *         schema:
 *           type: string
 *         description: The branch ID to filter promotions.
 *       - in: query
 *         name: providerId
 *         schema:
 *           type: string
 *         description: The provider ID to filter promotions.
 *     responses:
 *       200:
 *         description: A list of promotions.
 *       500:
 *         description: Internal server error.
 */
router.get("/promotions", asyncHandler(controller.list));

module.exports = router;
