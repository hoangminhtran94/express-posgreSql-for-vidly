const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function main() {
  const confirmed = await prisma.orderStatus.upsert({
    where: { id: "confirmed" },
    update: {},
    create: {
      id: "confirmed",
      name: "Confirmed",
    },
  });

  const declined = await prisma.orderStatus.upsert({
    where: { id: "declined" },
    update: {},
    create: {
      id: "declined",
      name: "Declined",
    },
  });
  const cancelled = await prisma.orderStatus.upsert({
    where: { id: "cancelled" },
    update: {},
    create: {
      id: "cancelled",
      name: "Cancelled",
    },
  });
  const finished = await prisma.orderStatus.upsert({
    where: { id: "finished" },
    update: {},
    create: {
      id: "finished",
      name: "Finished",
    },
  });
  const pending = await prisma.orderStatus.upsert({
    where: { id: "pending" },
    update: {},
    create: {
      id: "pending",
      name: "Pending",
    },
  });
  await prisma.orderStatus.upsert({
    where: { id: "shipping" },
    update: {},
    create: {
      id: "shipping",
      name: "Shipping",
    },
  });
  await prisma.orderStatus.upsert({
    where: { id: "shipped" },
    update: {},
    create: {
      id: "shipped",
      name: "Shipped",
    },
  });
  await prisma.orderStatus.upsert({
    where: { id: "returned" },
    update: {},
    create: {
      id: "returned",
      name: "Returned",
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
