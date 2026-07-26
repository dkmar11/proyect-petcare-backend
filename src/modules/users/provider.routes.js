const { Router } = require("express");
const controller = require("./provider.controller");
const asyncHandler = require("../../shared/middlewares/async-handler");
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

/**
 * @swagger
 * /api/providers/login:
 *   post:
 *     summary: Provider login
 *     description: Authenticates a provider by email and password.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Provider authenticated successfully.
 *       401:
 *         description: Invalid credentials.
 */
router.post("/providers/login", asyncHandler(controller.login));

/**
 * @swagger
 * /api/providers/{id}:
 *   patch:
 *     summary: Update provider
 *     description: Updates a provider.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: The provider ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Provider updated successfully.
 *       404:
 *         description: Provider not found.
 */
router.patch("/providers/:id", asyncHandler(controller.update));

module.exports = router;
