const providers = require("../services/provider.service");
exports.list = async (req, res) => res.json(await providers.list(req.query));
