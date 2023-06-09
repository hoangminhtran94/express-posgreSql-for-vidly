const { prisma } = require("../utils/prisma");
const HttpError = require("../models/errors");

exports.getYourOrders = async (req, res, next) => {
  const user = req.user;
  let orders;
  try {
    orders = await prisma.order.findMany({
      where: { shoppingCart: { ownerId: user.id } },
      include: {
        orderStatus: true,
        orderItems: { include: { movie: { include: { owner: true } } } },
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
        orderStatus: true,
        orderItems: { include: { movie: true } },
        shoppingCart: { select: { owner: true } },
      },
    });
  } catch (error) {
    return next(new HttpError("Something went wrong, please try again", 500));
  }

  res.json(orders).status(201);
};

exports.updateYourOrder = async (req, res, next) => {
  const user = req.user;
  let orderId = req.params;
  const newStatus = req.orderStatus;
  const acceptedStatus = ["cancelled", "returned"];

  if (!acceptedStatus.includes(newStatus)) {
    return next(new HttpError("Unauthorized", 403));
  }

  let order;
  try {
    order = await prisma.order.findFirst({
      where: { id: orderId },
      include: { shoppingCart: { include: { owner: true } } },
    });
  } catch (error) {
    return next(new HttpError("Something went wrong, please try again", 500));
  }
  if (!order) {
    return next(new HttpError("Order not found", 403));
  }

  if (order.shoppingCart.ownerId !== user.id) {
    return next(new HttpError("Unauthorized", 403));
  }

  try {
    await prisma.$transaction(async (ctx) => {
      await ctx.order.update({
        where: { id: orderId },
        data: { orderStatus: { connect: { id: newStatus } } },
      });
      if (newStatus === "cancelled") {
        const orderItems = order.orderItems;
        let promises = [];
        orderItems.forEach((item) =>
          promises.push(
            ctx.movie.update({
              where: { id: item.movieId },
              data: { numberInStock: { increment: +item.quantity } },
            })
          )
        );
        await Promise.all(promises);
      }
    });
  } catch (e) {
    return next(new HttpError("Something went wrong, please try again", 500));
  }
  return res.json({ message: "Success" }).status(201);
};

exports.updateCustomerOrderStatus = async (req, res, next) => {
  const user = req.user;
  let { orderId } = req.params;
  const newStatus = req.body.orderStatus;
  const acceptedStatus = [
    "confirmed",
    "declined",
    "finished",
    "shipping",
    "shipped",
  ];

  if (!acceptedStatus.includes(newStatus)) {
    return next(new HttpError("Unauthorized", 403));
  }

  let order;
  try {
    order = await prisma.order.findFirst({
      where: { id: orderId },
      include: { shoppingCart: { include: { owner: true } }, orderItems: true },
    });
  } catch (error) {
    return next(new HttpError("Something went wrong, please try again", 500));
  }
  if (!order) {
    return next(new HttpError("Order not found", 403));
  }
  if (order.userId !== user.id) {
    return next(new HttpError("Unauthorized", 403));
  }
  if (order.shoppingCart.ownerId === user.id) {
    return next(new HttpError("Unauthorized", 403));
  }

  try {
    await prisma.$transaction(async (ctx) => {
      await ctx.order.update({
        where: { id: orderId },
        data: { orderStatus: { connect: { id: newStatus } } },
      });
      const orderItems = order.orderItems;
      if (newStatus === "declined") {
        let promises = [];
        orderItems.forEach((item) =>
          promises.push(
            ctx.movie.update({
              where: { id: item.movieId },
              data: { numberInStock: { increment: +item.quantity } },
            })
          )
        );
        await Promise.all(promises);
      }
    });
  } catch (error) {
    return next(new HttpError("Something went wrong, please try again", 500));
  }

  return res.json({ message: "Success" }).status(201);
};
