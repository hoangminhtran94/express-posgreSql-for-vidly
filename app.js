const express = require("express");
const bodyParser = require("body-parser");
const movieRoute = require("./routes/movies-route");
const userRoute = require("./routes/user-route");
const app = express();
const path = require("path");
const db = require("./utils/database");
const errorHandler = require("./middleware/error-handler");
const Movie = require("./models/movies");
const User = require("./models/user");
const Genre = require("./models/genre");
const ShoppingCart = require("./models/shopping-cart");
const CartItem = require("./models/cart-item");
const Order = require("./models/order");
const OrderItem = require("./models/order-item");
// const OrderUser = require("./models/order-user")

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

app.use(bodyParser.json());

app.use("/storage/images", express.static(path.join("storage", "images")));

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Request-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");
  next();
});
app.use("/api/movies", movieRoute);
app.use("/api/user", userRoute);

app.use(errorHandler);

db.sync()
  .then((result) => {
    app.listen(5000);
  })
  .catch((error) => {
    console.log(error);
  });
