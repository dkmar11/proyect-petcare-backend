const prisma = require("../infrastructure/persistence/prisma/client");
const AppError = require("../domain/errors/app-error");

async function upsert({ fullName, email }) {
  if (!fullName || !email) throw new AppError("fullName y email son obligatorios.");
  return prisma.user.upsert({ where: { email }, update: { fullName }, create: { fullName, email } });
}

async function getAll() {
  return prisma.user.findMany();
}

module.exports = { upsert, getAll };
