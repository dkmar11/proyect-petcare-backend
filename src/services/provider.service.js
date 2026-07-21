const prisma = require("../infrastructure/persistence/prisma/client");
const AppError = require("../domain/errors/app-error");
const list = ({ city, serviceType }) => prisma.provider.findMany({ where: { ...(city ? { city } : {}), ...(serviceType ? { providerType: serviceType } : {}) }, include: { branch: true }, orderBy: { displayName: "asc" } });
async function create(data) {
  const { branchId, name, city, address, latitude, longitude, displayName, providerType, supportsPickup, supportsHome } = data;
  if (!displayName || !providerType || !city) throw new AppError("displayName, providerType y city son obligatorios.");
  let finalBranchId = branchId;
  if (!finalBranchId && name && address) {
    const branch = await prisma.branch.create({ data: { name: name || displayName, city, address, latitude: latitude ? Number(latitude) : null, longitude: longitude ? Number(longitude) : null } });
    finalBranchId = branch.id;
  }
  if (!finalBranchId) throw new AppError("Debes enviar branchId o datos de sucursal (name, address).");
  return prisma.provider.create({ data: { displayName, providerType, city, supportsPickup: Boolean(supportsPickup), supportsHome: Boolean(supportsHome), branchId: finalBranchId }, include: { branch: true } });
}
module.exports = { list, create };
