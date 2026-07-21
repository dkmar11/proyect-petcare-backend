const prisma = require("../infrastructure/persistence/prisma/client");
const AppError = require("../domain/errors/app-error");
const list = ({ city, serviceType }) => prisma.provider.findMany({ where: { ...(city ? { city } : {}), ...(serviceType ? { providerType: serviceType } : {}) }, include: { branch: true }, orderBy: { displayName: "asc" } });
async function create(data) {
  const { branchId, name, city, address, latitude, longitude, displayName, providerType, supportsPickup, supportsHome, email, password } = data;
  if (!displayName || !providerType || !city || !email || !password) throw new AppError("displayName, providerType, city, email y password son obligatorios.");
  let finalBranchId = branchId;
  if (!finalBranchId && name && address) {
    const branch = await prisma.branch.create({ data: { name: name || displayName, city, address, latitude: latitude ? Number(latitude) : null, longitude: longitude ? Number(longitude) : null } });
    finalBranchId = branch.id;
  }
  if (!finalBranchId) throw new AppError("Debes enviar branchId o datos de sucursal (name, address).");
  return prisma.provider.create({ data: { displayName, providerType, city, email, password, supportsPickup: Boolean(supportsPickup), supportsHome: Boolean(supportsHome), branchId: finalBranchId }, include: { branch: true } });
}
async function login({ email, password }) {
  if (!email || !password) throw new AppError("Email y password son obligatorios.");
  const provider = await prisma.provider.findUnique({ where: { email }, include: { branch: true } });
  if (!provider || provider.password !== password) throw new AppError("Credenciales incorrectas.", 401);
  return provider;
}
module.exports = { list, create, login };
