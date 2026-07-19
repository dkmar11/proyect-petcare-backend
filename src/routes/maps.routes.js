const { Router } = require("express");
const controller = require("../controllers/map.controller");
const asyncHandler = require("../middlewares/async-handler");
const router = Router(); router.get("/maps/link", asyncHandler(controller.link)); module.exports = router;
