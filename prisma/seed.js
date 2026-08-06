const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const branch = await prisma.branch.upsert({
    where: { id: "branch-calacoto" },
    update: {},
    create: { id: "branch-calacoto", name: "PetCare Calacoto", city: "La Paz", address: "Av. Ballivián 1234, La Paz", latitude: -16.539, longitude: -68.079 },
  });
  const provider = await prisma.provider.upsert({
    where: { id: "provider-calacoto" },
    update: {},
    create: { id: "provider-calacoto", displayName: "PetCare Calacoto", providerType: "ALL", city: "La Paz", supportsPickup: true, supportsHome: true, branchId: branch.id },
  });
  const user = await prisma.user.upsert({ where: { email: "andrea@petcare.demo" }, update: {}, create: { fullName: "Andrea Ramírez", email: "andrea@petcare.demo" } });
  await prisma.pet.upsert({ where: { id: "pet-milo" }, update: {}, create: { id: "pet-milo", name: "Milo", species: "Perro", breed: "Golden Retriever", ownerId: user.id } });
  console.log({ userId: user.id, providerId: provider.id });
}
main().finally(() => prisma.$disconnect());
