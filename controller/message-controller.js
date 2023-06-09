const HttpError = require("../models/errors");
const fs = require("fs");
const { prisma } = require("../utils/prisma");
const Message = require("../models/mongoDb/message");

exports.createChatRoom = async (req, res, next) => {
  const user = req.user;
  const receiverId = req.body.receiverId;
  if (!user || !receiverId) {
    return next(new HttpError("Invalid request", 500));
  }

  const roomId = [user.id, receiverId].sort((a, b) => a - b).join("-");

  let messageRoom;
  try {
    messageRoom = await prisma.messageRoom.findFirst({
      where: { id: roomId },
      include: { messageRoute: { where: { userId: user.id } } },
    });
  } catch (error) {
    return next(
      new HttpError("Something wrong happened, please try again", 500)
    );
  }
  if (messageRoom) {
    return res.json(messageRoom.messageRouteId).status(201);
  }

  if (!messageRoom) {
    let renderRoute;
    try {
      renderRoute = await prisma.$transaction(async (ctx) => {
        const senderRoute = await ctx.messageRoute.create({
          data: {
            user: { connect: { id: user.id } },
            messageRoom: {
              connectOrCreate: {
                where: { id: roomId },
                create: { id: roomId },
              },
            },
          },
        });
        await ctx.messageRoute.create({
          data: {
            user: { connect: { id: receiverId } },
            messageRoom: {
              connectOrCreate: {
                where: { id: roomId },
                create: { id: roomId },
              },
            },
          },
        });
        return senderRoute;
      });
    } catch (error) {
      return next(
        new HttpError("Something wrong happened, please try again", 500)
      );
    }

    try {
      await Message.create({ roomId: roomId });
    } catch (error) {
      return next(
        new HttpError("Something wrong happened, please try again", 500)
      );
    }

    return res.json(renderRoute.id).status(201);
  }
};

exports.sendMessage = async (req, res, next) => {
  const user = req.user;
  const receiverId = req.body.receiverId;

  let room = await prisma.messageRoute.findMany({
    where: { OR: [{ userId: user.id }, { userId: receiverId }] },
  });
};
