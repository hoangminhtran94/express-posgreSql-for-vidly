const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const confirmed = await prisma.orderStatus.upsert({
    where: { name: "confirmed" },
    update: {},
    create: {
      id: "confirmed",
      name: "confirmed",
    },
  });

  const declined = await prisma.orderStatus.upsert({
    where: { name: "declined" },
    update: {},
    create: {
      id: "declined",
      name: "declined",
    },
  });
  const cancelled = await prisma.orderStatus.upsert({
    where: { name: "cancelled" },
    update: {},
    create: {
      id: "cancelled",
      name: "cancelled",
    },
  });
  const finished = await prisma.orderStatus.upsert({
    where: { name: "finished" },
    update: {},
    create: {
      id: "finished",
      name: "finished",
    },
  });
  const pending = await prisma.orderStatus.upsert({
    where: { name: "pending" },
    update: {},
    create: {
      id: "pending",
      name: "pending",
    },
  });
}
main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    // eslint-disable-next-line no-undef
    process.exit(1);
  });
