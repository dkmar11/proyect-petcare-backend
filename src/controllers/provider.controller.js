const providers = require("../services/provider.service");
const AppError = require("../domain/errors/app-error");
const prisma = require("../infrastructure/persistence/prisma/client");
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
exports.login = async (req, res) => {
  try {
    const data = await providers.login(req.body);
    res.json(data);
  } catch (error) {
    if (error instanceof AppError) return res.status(error.status || 401).json({ error: error.message });
    throw error;
  }
};
exports.listBookings = async (req, res) => res.json(await prisma.booking.findMany({ where: { providerId: req.params.providerId }, include: { pet: true, user: true, promotion: true }, orderBy: { scheduledAt: "asc" } }));
exports.update = async (req, res) => {
  try {
    const data = await prisma.provider.update({ where: { id: req.params.id }, data: req.body, include: { branch: true } });
    res.json(data);
  } catch (error) {
    if (error.code === "P2025") return res.status(404).json({ error: "Proveedor no encontrado." });
    throw error;
  }
};
