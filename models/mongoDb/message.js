const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const childrenSchema = new Schema({
  senderId: { type: String, required: true },
  receiverId: { type: String, required: true },
  message: { type: String, required: true },
  time: { type: Date, required: true, default: Date.now },
  read: { type: Boolean, required: true, default: false },
});

const messageSchema = new Schema({
  roomId: { type: String, required: true, unique: true },
  children: [childrenSchema],
});
module.exports = mongoose.model("Message", messageSchema);
