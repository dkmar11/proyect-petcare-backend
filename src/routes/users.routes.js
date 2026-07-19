const { Router } = require("express");
const controller = require("../controllers/user.controller");
const asyncHandler = require("../middlewares/async-handler");
const router = Router();
router.post("/users", asyncHandler(controller.upsert));
module.exports = router;
