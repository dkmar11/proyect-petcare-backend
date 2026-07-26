const pets = require("./pet.service");
const AppError = require("../../shared/errors/app-error");
exports.list = async (req, res) => res.json(await pets.listByOwner(req.params.userId));
exports.create = async (req, res) => res.status(201).json(await pets.create(req.params.userId, req.body));
exports.uploadVaccination = async (req, res) => {
  if (!req.file) throw new AppError("Adjunta un archivo PDF o imagen de máximo 5 MB.");
  res.json(await pets.saveVaccinationRecord(req.params.petId, req.file.filename));
};
