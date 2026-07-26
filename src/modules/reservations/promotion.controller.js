const promotions = require("./promotion.service");
exports.list = async (req, res) => res.json(await promotions.listAvailable(req.query));
