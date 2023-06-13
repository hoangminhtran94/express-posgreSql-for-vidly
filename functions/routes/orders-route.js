const express = require("express");
const checkAuth = require("../middleware/auth");
const {
  getYourOrders,
  getCustomer,
  updateYourOrder,
  updateCustomerOrderStatus,
} = require("../controller/order-controller");
const orderRoute = express.Router();

orderRoute.use(checkAuth);
orderRoute.get("/", getYourOrders);
orderRoute.get("/customers", getCustomer);
orderRoute.post("/:orderId/update-your-order", updateYourOrder);
orderRoute.post("/:orderId/change-status", updateCustomerOrderStatus);

module.exports = orderRoute;
