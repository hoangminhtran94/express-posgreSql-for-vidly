const express = require("express");
const checkAuth = require("../middleware/auth");
const {
  getCart,
  postCartItem,
  deleteCartItem,
  checkout,
} = require("../controller/shopping-cart-controller");
const route = express.Router();

route.use(checkAuth);
route.get("/", getCart);
route.post("/", postCartItem);
route.post("/checkout", checkout);
route.delete("/:cartId", deleteCartItem);
