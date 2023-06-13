const express = require("express");
const checkAuth = require("../middleware/auth");
const messageRouter = express.Router();
const {
  getMessages,
  sendMessage,
  getChatList,
} = require("../controller/message-controller");

messageRouter.use(checkAuth);
messageRouter.get("/chat-list", getChatList);
messageRouter.get("/:receiverId", getMessages);
messageRouter.post("/send", sendMessage);

module.exports = messageRouter;
