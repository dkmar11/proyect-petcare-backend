const prisma = require("../infrastructure/persistence/prisma/client");
const AppError = require("../domain/errors/app-error");
function activeWhere(now, branchId, providerId) { return { active: true, startsAt: { lte: now }, endsAt: { gte: now }, OR: [{ scope: "NATIONAL" }, ...(branchId ? [{ branchId }] : []), ...(providerId ? [{ providerId }] : [])] }; }
const listAvailable = ({ branchId, providerId }) => prisma.promotion.findMany({ where: activeWhere(new Date(), branchId, providerId), orderBy: { discountPct: "desc" } });
async function findApplicable(code, provider) {
  const promotion = await prisma.promotion.findFirst({ where: { code, ...activeWhere(new Date(), provider.branchId, provider.id) } });
  if (!promotion) throw new AppError("La promoción no es válida para este proveedor.");
  return promotion;
}
module.exports = { listAvailable, findApplicable };
