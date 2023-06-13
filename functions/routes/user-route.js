const express = require("express");
const { fileUpload } = require("../middleware/file-upload");
const {
  register,
  login,
  getCustomerData,
  validateToken,
} = require("../controller/user-controller");
const checkAuth = require("../middleware/auth");
const userRoute = express.Router();

userRoute.post("/register", fileUpload.single("image"), register);
userRoute.post("/login", login);
userRoute.use(checkAuth).get("/validate-token", validateToken);
userRoute.get("/:userId", getCustomerData);

module.exports = userRoute;
