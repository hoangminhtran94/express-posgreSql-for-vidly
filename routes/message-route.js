const express = require("express");
const checkAuth = require("../middleware/auth");
const HttpError = require("../models/errors");
const Message = require("../models/mongoDb/message");
const router = express.Router();

router.use(checkAuth);
router.post("/", async (req, res, next) => {
  const { roomId } = req.body;
  let messages;
  try {
    messages = await Message.findOne({ roomId: roomId });
  } catch (error) {
    return next(new HttpError("Something wrong happened", 404));
  }
  if (!messages) {
    return res.json([]).status(201);
  }
  const collectionLength = messages.children.length;
  return res
    .json(messages.children.slice(collectionLength - 10, collectionLength))
    .status(201);
});

module.exports = router;
