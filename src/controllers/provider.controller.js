const providers = require("../services/provider.service");
const AppError = require("../domain/errors/app-error");
exports.list = async (req, res) => res.json(await providers.list(req.query));
exports.create = async (req, res) => {
  try {
    const data = await providers.create(req.body);
    res.status(201).json(data);
  } catch (error) {
    if (error instanceof AppError) return res.status(400).json({ error: error.message });
    throw error;
  }
};
