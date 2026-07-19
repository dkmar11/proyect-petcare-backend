const users = require("../services/user.service");
exports.upsert = async (req, res) => res.status(201).json(await users.upsert(req.body));
