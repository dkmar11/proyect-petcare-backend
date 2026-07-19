const { Router } = require("express");
const controller = require("../controllers/pet.controller");
const asyncHandler = require("../middlewares/async-handler");
const upload = require("../infrastructure/storage/vaccination-upload");
const router = Router();

/**
 * @swagger
 * /api/users/{userId}/pets:
 *   get:
 *     summary: List user's pets
 *     description: Retrieves a list of pets for a specific user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's ID.
 *     responses:
 *       200:
 *         description: A list of pets.
 *       404:
 *         description: User not found.
 */
router.get("/users/:userId/pets", asyncHandler(controller.list));

/**
 * @swagger
 * /api/users/{userId}/pets:
 *   post:
 *     summary: Create a new pet
 *     description: Creates a new pet for a specific user.
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user's ID.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               species:
 *                 type: string
 *               breed:
 *                 type: string
 *               age:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Pet created successfully.
 *       400:
 *         description: Bad request.
 */
router.post("/users/:userId/pets", asyncHandler(controller.create));

/**
 * @swagger
 * /api/pets/{petId}/vaccination-record:
 *   post:
 *     summary: Upload vaccination record
 *     description: Uploads a vaccination record for a specific pet.
 *     parameters:
 *       - in: path
 *         name: petId
 *         required: true
 *         schema:
 *           type: string
 *         description: The pet's ID.
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               record:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Vaccination record uploaded successfully.
 *       404:
 *         description: Pet not found.
 */
router.post("/pets/:petId/vaccination-record", upload.single("record"), asyncHandler(controller.uploadVaccination));

module.exports = router;

