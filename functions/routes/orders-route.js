const express = require("express");
const checkAuth = require("../middleware/auth");
const {
  getYourOrders,
  getCustomer,
  updateYourOrder,
  updateCustomerOrderStatus,
} = require("../../controller/order-controller");
const route = express.Router();

route.use(checkAuth);
route.get("/", getYourOrders);
route.get("/customers", getCustomer);
route.post("/:orderId/update-your-order", updateYourOrder);
route.post("/:orderId/change-status", updateCustomerOrderStatus);

module.exports = route;
