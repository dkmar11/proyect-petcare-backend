const { Router } = require("express");
const controller = require("./user.controller");
const asyncHandler = require("../../shared/middlewares/async-handler");
const router = Router();

/**
 * @swagger
 * /api/users:
 *   post:
 *     summary: Create or update a user
 *     description: Create or update a user with the provided data.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *                 description: The user ID.
 *               email:
 *                 type: string
 *                 description: The user's email.
 *               name:
 *                 type: string
 *                 description: The user's name.
 *               phone:
 *                 type: string
 *                 description: The user's phone number.
 *               address:
 *                 type: string
 *                 description: The user's address.
 *     responses:
 *       200:
 *         description: User created or updated successfully.
 *       400:
 *         description: Bad request.
 */
router.post("/users", asyncHandler(controller.upsert));

/**
 * @swagger
 * /api/users:
 *   get:
 *     summary: Get all users
 *     description: Retrieve a list of all users.
 *     responses:
 *       200:
 *         description: A list of users.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     description: The user ID.
 *                   email:
 *                     type: string
 *                     description: The user's email.
 *                   name:
 *                     type: string
 *                     description: The user's name.
 *                   phone:
 *                     type: string
 *                     description: The user's phone number.
 *                   address:
 *                     type: string
 *                     description: The user's address.
 *       500:
 *         description: Internal server error.
 */
router.get("/users", asyncHandler(controller.getAll));

router.post("/users/login", asyncHandler(controller.login));

module.exports = router;
