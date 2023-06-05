const express = require("express");
const bodyParser = require("body-parser");
const movieRoute = require("./routes/movies-route");
const userRoute = require("./routes/user-route");
const orderRoute = require("./routes/orders-route");
const messageRoute = require("./routes/message-route");
const genreRoute = require("./routes/genre-route");
const shoppingCartRoute = require("./routes/shopping-cart-route");
const likeRoute = require("./routes/shopping-cart-route");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Message = require("./models/mongoDb/message");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: "*" } });
const errorHandler = require("./middleware/error-handler");
const { corsHandler } = require("./middleware/cors");

// Socket.io
io.on("connection", (socket) => {
  let roomName;
  let sender;
  let receiver;
  socket.on("join-room", (senderId, receiverId) => {
    sender = senderId;
    receiver = receiverId;
    roomName = [senderId, receiverId]
      .sort((a, b) => (a < b ? 1 : -1))
      .join("-");
    socket.join(roomName);
  });

  socket.on("send-message", (message) => {
    if (roomName) {
      Message.findOne({ roomId: roomName })
        .then((result) => {
          if (!result) {
            const newMessage = new Message({
              roomId: roomName,
              children: [
                {
                  senderId: sender,
                  receiverId: receiver,
                  message: message,
                  time: new Date(Date.now()),
                },
              ],
            });
            return newMessage.save();
          }
          result.children.push({
            senderId: sender,
            receiverId: receiver,
            message: message,
            time: new Date(Date.now()),
          });
          return result.save();
        })
        .then((res) => {
          socket.to(roomName).emit("receive-message", {
            senderId: sender,
            receiverId: receiver,
            message: message,
            time: new Date(Date.now()),
          });
        })
        .catch((e) => {
          console.log(e);
        });
    }
  });
  socket.on("error", (error) => {
    if (error) {
      socket.disconnect();
    }
  });
});
//Serve static Image

//Routes
app.use(bodyParser.json());
app.use(corsHandler);
app.use("/storage/images", express.static(path.join("storage", "images")));
app.use("/api/messages", messageRoute);
app.use("/api/movies", movieRoute);
app.use("/api/user", userRoute);
app.use("/api/orders", orderRoute);
app.use("/api/genre", genreRoute);
app.use("/api/shopping-cart", shoppingCartRoute);
app.use("/api/like", likeRoute);
app.use(errorHandler);

mongoose
  // eslint-disable-next-line no-undef
  .connect(process.env.MONGODB_CONNECTION)
  .then(() => {
    server.listen(5000);
  })
  .catch((e) => console.log(e));
