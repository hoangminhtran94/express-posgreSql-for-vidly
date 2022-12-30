const express = require("express");
const bodyParser = require("body-parser");
const movieRoute = require("./routes/movies-route");
const userRoute = require("./routes/user-route");
const messageRoute = require("./routes/message-route");
const app = express();
const path = require("path");
const db = require("./utils/database");
const mongoose = require("mongoose");
const Message = require("./models/mongoDb/message");
const http = require("http");
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, { cors: { origin: ["http://localhost:3000"] } });
const errorHandler = require("./middleware/error-handler");
const { corsHandler } = require("./middleware/cors");

//database model
const Movie = require("./models/movies");
const User = require("./models/user");
const Genre = require("./models/genre");
const ShoppingCart = require("./models/shopping-cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");
// const OrderUser = require("./models/order-user")
// const formData = multer();
Movie.belongsTo(Genre, { constraints: true, onDelete: "CASCADE" });
Genre.hasMany(Movie);
Movie.belongsTo(User, { constraints: true, onDelete: "CASCADE" });
User.hasMany(Movie);
ShoppingCart.belongsTo(User);
User.hasOne(ShoppingCart);
ShoppingCart.belongsToMany(Movie, { through: CartItem });
Movie.belongsToMany(ShoppingCart, { through: CartItem });
Order.belongsTo(User);
User.hasMany(Order);
Order.belongsToMany(Movie, { through: OrderItem });
Movie.belongsToMany(Order, { through: OrderItem });

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

app.use(errorHandler);

db.sync()
  .then((result) => {
    return mongoose.connect(process.env.MONGODB_CONNECTION);
  })
  .then((result) => {
    server.listen(5000);
  })
  .catch((error) => {
    console.log(error);
  });
