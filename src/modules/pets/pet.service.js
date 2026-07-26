const prisma = require("../../shared/infrastructure/persistence/prisma/client");
const AppError = require("../../shared/errors/app-error");

const listByOwner = (ownerId) => prisma.pet.findMany({ where: { ownerId }, orderBy: { createdAt: "desc" } });
async function create(ownerId, data) {
  if (!data.name || !data.species) throw new AppError("name y species son obligatorios.");
  return prisma.pet.create({ data: { name: data.name, species: data.species, breed: data.breed, specialHandlingNote: data.specialHandlingNote, ownerId, dateOfBirth: data.dateOfBirth ? new Date(data.dateOfBirth) : null } });
}
const saveVaccinationRecord = (petId, filename) => prisma.pet.update({ where: { id: petId }, data: { vaccinationRecord: `/uploads/vaccinations/${filename}` } });
module.exports = { listByOwner, create, saveVaccinationRecord };
