const promotions = require("../services/promotion.service");
exports.list = async (req, res) => res.json(await promotions.listAvailable(req.query));
