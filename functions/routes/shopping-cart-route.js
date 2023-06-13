const express = require("express");
const checkAuth = require("../middleware/auth");
const {
  getCart,
  postCartItem,
  deleteCartItem,
  checkout,
} = require("../controller/shopping-cart-controller");
const shoppingCartRoute = express.Router();

shoppingCartRoute.use(checkAuth);
shoppingCartRoute.get("/", getCart);
shoppingCartRoute.post("/", postCartItem);
shoppingCartRoute.post("/checkout", checkout);
shoppingCartRoute.delete("/:cartId", deleteCartItem);

module.exports = shoppingCartRoute;
