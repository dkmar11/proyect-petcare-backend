const { Router } = require("express");
const controller = require("../controllers/promotion.controller");
const asyncHandler = require("../middlewares/async-handler");
const router = Router(); router.get("/promotions", asyncHandler(controller.list)); module.exports = router;
