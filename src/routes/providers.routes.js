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

/**
 * @swagger
 * /api/providers:
 *   post:
 *     summary: Create provider
 *     description: Creates a service provider.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               displayName:
 *                 type: string
 *               providerType:
 *                 type: string
 *               city:
 *                 type: string
 *               branchId:
 *                 type: string
 *               name:
 *                 type: string
 *               address:
 *                 type: string
 *               latitude:
 *                 type: number
 *               longitude:
 *                 type: number
 *               supportsPickup:
 *                 type: boolean
 *               supportsHome:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Provider created successfully.
 *       400:
 *         description: Bad request.
 */
router.post("/providers", asyncHandler(controller.create));

module.exports = router;

