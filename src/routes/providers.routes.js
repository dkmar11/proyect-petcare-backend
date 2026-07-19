const { Router } = require("express");
const controller = require("../controllers/provider.controller");
const asyncHandler = require("../middlewares/async-handler");
const router = Router(); router.get("/providers", asyncHandler(controller.list)); module.exports = router;
