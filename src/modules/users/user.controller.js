const users = require("./user.service");
exports.upsert = async (req, res) => res.status(201).json(await users.upsert(req.body));
exports.getAll = async (req, res) => res.status(200).json(await users.getAll());
exports.login = async (req, res) => res.status(200).json(await users.login(req.body));
