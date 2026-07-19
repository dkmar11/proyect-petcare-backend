const prisma = require("../infrastructure/persistence/prisma/client");
const list = ({ city, serviceType }) => prisma.provider.findMany({ where: { ...(city ? { city } : {}), ...(serviceType ? { providerType: serviceType } : {}) }, include: { branch: true }, orderBy: { displayName: "asc" } });
module.exports = { list };
