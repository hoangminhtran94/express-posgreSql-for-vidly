const HttpError = require("../models/errors");
const User = require("../models/user");
const jwt = require("jsonwebtoken");

require("dotenv").config();
module.exports = async (req, res, next) => {
  if (req.method === "OPTIONS") {
    return next();
  }
  let token;
  try {
    token = req.headers.authorization.split(" ")[1];
    if (!token) {
      throw new HttpError("UnAuthorized, please login first", 403);
    }
  } catch (error) {
    return next(new HttpError("Authentication failed, please try agin", 500));
  }
  let decodedToken;
  try {
    decodedToken = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return next(new HttpError("Authentication failed, please try agin", 500));
  }
  let user;
  try {
    user = await User.findByPk(decodedToken.userId);
  } catch (error) {
    return next(new HttpError("Authentication failed, please try agin", 500));
  }
  if (user) {
    req.user = user;
  } else {
    return next(new HttpError("Authentication failed, please try agin", 500));
  }
  next();
};
