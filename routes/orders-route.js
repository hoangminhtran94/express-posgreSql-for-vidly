const express = require("express");
const checkAuth = require("../middleware/auth");
const {
  getYourOrders,
  getCustomer,
} = require("../controller/order-controller");
const route = express.Router();

route.use(checkAuth);
route.get("/", getYourOrders);
route.get("/customers", getCustomer);

module.exports = route;
