const express = require("express");
const checkAuth = require("../middleware/auth");
const router = express.Router();
const {
  getMessages,
  sendMessage,
  getChatList,
} = require("../controller/message-controller.js");
router.use(checkAuth);
router.get("/chat-list", getChatList);
router.get("/:receiverId", getMessages);
router.post("/send", sendMessage);

module.exports = router;
