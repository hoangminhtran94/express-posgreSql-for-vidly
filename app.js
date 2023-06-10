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
const { prisma } = require("./utils/prisma");
const jwt = require("jsonwebtoken");
// Socket.io
io.use(async (socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) {
    next(new Error("UnAuthorized, please login first"));
  }
  let decodedToken;
  try {
    // eslint-disable-next-line no-undef
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    next(new Error("Authentication failed, please try agin"));
  }
  let user;
  try {
    user = await prisma.user.findFirst({ where: { id: decodedToken.userId } });
  } catch (error) {
    next(new Error("Authentication failed, please try agin"));
  }
  if (user) {
    socket.request.user = user;
  } else {
    next(new Error("Authentication failed, please try agin", 500));
  }
  next();
}).on("connection", (socket) => {
  let senderId = socket.request.user.id;
  let receiver;
  socket.on("join-room", (roomId) => {
    if (roomId) {
      socket.request.roomId = roomId;
      socket.join(roomId);
    }
  });

  socket.on("send-message", (message) => {
    if (socket.request.roomId) {
      Message.findOne({ roomId: socket.request.roomId })
        .then((result) => {
          if (!result) {
            const newMessage = new Message({
              roomId: socket.request.roomId,
              children: [
                {
                  senderId: senderId,
                  receiverId: receiver,
                  message: message,
                  read: false,
                },
              ],
            });
            return newMessage.save();
          }
          result.children.push({
            senderId: senderId,
            receiverId: receiver,
            message: message,
            read: false,
          });
          return result.save();
        })
        .then((res) => {
          socket.to(socket.request.roomId).emit("receive-message", res);
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
  socket.on("connect_error", (err) => {
    console.log(err);
    if (err) {
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
