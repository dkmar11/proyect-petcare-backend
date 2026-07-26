const { Router } = require("express");
const controller = require("./map.controller");
const asyncHandler = require("../../shared/middlewares/async-handler");
const router = Router();

/**
 * @swagger
 * /api/maps/link:
 *   get:
 *     summary: Get a map link
 *     description: Retrieves a link to a map with a specific location.
 *     responses:
 *       200:
 *         description: A map link.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 link:
 *                   type: string
 *                   description: The URL to the map.
 *       500:
 *         description: Internal server error.
 */
router.get("/maps/link", asyncHandler(controller.link));

module.exports = router;
