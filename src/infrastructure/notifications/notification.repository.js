const prisma = require("../persistence/prisma/client");
const create = (data) => prisma.notification.create({ data });
module.exports = { create };
