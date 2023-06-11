const HttpError = require("../models/errors");
const fs = require("fs");
const { prisma } = require("../utils/prisma");
const Message = require("../models/mongoDb/message");

exports.getMessages = async (req, res, next) => {
  const user = req.user;
  const { receiverId } = req.params;
  if (!user || !receiverId) {
    return next(new HttpError("Invalid request", 500));
  }

  let messageRoom;
  try {
    messageRoom = await prisma.messageRoom.findFirst({
      where: {
        messageRoute: {
          every: { OR: [{ userId: user.id }, { userId: receiverId }] },
        },
      },
    });
  } catch (error) {
    return next(
      new HttpError("Something wrong happened, please try again", 500)
    );
  }

  let messages;
  if (messageRoom) {
    try {
      messages = await Message.findOne({ roomId: messageRoom.id });
    } catch (error) {
      return next(
        new HttpError("Something wrong happened, please try again", 500)
      );
    }
    if (messages.children.length > 0) {
      messages.children.map((child) => ({ ...child, read: true }));

      try {
        messages = await messages.save();
      } catch (error) {
        return next(
          new HttpError("Something wrong happened, please try again", 500)
        );
      }
    }
  }

  if (!messageRoom) {
    try {
      messageRoom = await prisma.$transaction(async (ctx) => {
        return await ctx.messageRoom.create({
          data: {
            messageRoute: {
              create: [
                { user: { connect: { id: user.id } } },
                { user: { connect: { id: receiverId } } },
              ],
            },
          },
        });
      });
    } catch (error) {
      console.log(error);
      return next(
        new HttpError("Something wrong happened, please try again", 500)
      );
    }

    try {
      messages = await Message.create({
        roomId: messageRoom.id,
        children: [],
      });
    } catch (error) {
      return next(
        new HttpError("Something wrong happened, please try again", 500)
      );
    }
  }
  return res.json(messages).status(201);
};

exports.sendMessage = async (req, res, next) => {
  const user = req.user;
  const receiverId = req.body.receiverId;
  const message = req.body.message;

  let messageRoom;
  try {
    messageRoom = await prisma.messageRoom.findFirst({
      where: {
        messageRoute: {
          some: { OR: [{ userId: user.id }, { userId: receiverId }] },
        },
      },
    });
  } catch (error) {
    return next(
      new HttpError("Something wrong happened, please try again", 500)
    );
  }
  let messagRoomRef;
  try {
    messagRoomRef = await Message.findOne({ roomId: messageRoom.id });
  } catch (error) {
    return next(
      new HttpError("Something wrong happened, please try again", 500)
    );
  }
  if (!messagRoomRef) {
    messagRoomRef = await Message.create({ roomId: messageRoom.id });
  }

  messagRoomRef.children.push({
    senderId: user.id,
    receiverId: receiverId,
    message: message,
  });

  try {
    await messagRoomRef.save();
  } catch (error) {
    return next(
      new HttpError("Something wrong happened, please try again", 500)
    );
  }
  return res.json(messagRoomRef.children).status(201);
};

exports.getChatList = async (req, res, next) => {
  const user = req.user;

  let chatRooms;
  try {
    chatRooms = await prisma.messageRoom.findMany({
      where: { messageRoute: { some: { userId: user.id } } },
      include: { messageRoute: { include: { user: true } } },
    });
  } catch (error) {
    return next(
      new HttpError("Something wrong happened, please try again", 500)
    );
  }
  if (!chatRooms || chatRooms?.length === 0) {
    return res.json([]).status(201);
  }

  const chatlist = await Promise.all(
    chatRooms.map(async (room) => {
      let messageRoomData;
      try {
        messageRoomData = await Message.findOne({ roomId: room.id });
      } catch (error) {
        console.log(error);
      }

      const messages = messageRoomData.children;

      const receiverRoute = room.messageRoute.find(
        (route) => route.userId !== user.id
      );

      const unreadMessages = messages
        .filter((message) => message.receiverId === user.id)
        .filter((message) => message.read === false);

      return {
        roomId: room.id,
        user: receiverRoute.user,
        unreadCounter: unreadMessages.length,
      };
    })
  );

  return res.json(chatlist).status(201);
};
