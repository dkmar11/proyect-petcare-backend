const prisma = require("../../shared/infrastructure/persistence/prisma/client");
const AppError = require("../../shared/errors/app-error");

async function upsert({ fullName, email }) {
  if (!fullName || !email) throw new AppError("fullName y email son obligatorios.");
  return prisma.user.upsert({ where: { email }, update: { fullName }, create: { fullName, email } });
}

async function getAll() {
  return prisma.user.findMany();
}

async function login({ email }) {
  if (!email) throw new AppError("El email es obligatorio.");
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Usuario no encontrado.", 404);
  return user;
}

module.exports = { upsert, getAll, login };
