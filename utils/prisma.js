const { PrismaClient } = require("@prisma/client");
/**
 * @type PrismaClient
 */
let prisma;

// eslint-disable-next-line no-undef
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
  prisma.$connect();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
    global.__db.$connect();
  }
  prisma = global.__db;
}

module.exports = { prisma };
