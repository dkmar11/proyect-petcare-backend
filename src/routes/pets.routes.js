const { Router } = require("express");
const controller = require("../controllers/pet.controller");
const asyncHandler = require("../middlewares/async-handler");
const upload = require("../infrastructure/storage/vaccination-upload");
const router = Router();
router.get("/users/:userId/pets", asyncHandler(controller.list));
router.post("/users/:userId/pets", asyncHandler(controller.create));
router.post("/pets/:petId/vaccination-record", upload.single("record"), asyncHandler(controller.uploadVaccination));
module.exports = router;
