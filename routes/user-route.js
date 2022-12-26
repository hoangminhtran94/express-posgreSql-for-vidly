const express = require("express");
const { fileUpload } = require("../middleware/file-upload");
const {
  register,
  login,
  getCustomerData,
} = require("../controller/user-controller");
const userRoute = express.Router();

userRoute.post("/register", fileUpload.single("image"), register);
userRoute.post("/login", login);
userRoute.get("/:userId", getCustomerData);

module.exports = userRoute;
