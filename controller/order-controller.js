const { prisma } = require("../utils/prisma");
const HttpError = require("../models/errors");

exports.getYourOrders = async (req, res, next) => {
  const user = req.user;
  let orders;
  try {
    await prisma.order.findMany({
      where: { shoppingCart: { ownerId: user.id } },
      include: {
        orderItems: { include: { movie: true } },
      },
    });
  } catch (error) {
    return next(new HttpError("Something went wrong, please try again", 500));
  }

  res.json(orders).status(201);
};

exports.getCustomer = async (req, res, next) => {
  const user = req.user;
  let orders;
  try {
    orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        orderItems: { include: { movie: true } },
        shoppingCart: { select: { owner: true } },
      },
    });
  } catch (error) {
    return next(new HttpError("Something went wrong, please try again", 500));
  }

  res.json(orders).status(201);
};
