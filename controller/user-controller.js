const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const HttpError = require("../models/errors");
const User = require("../models/user");

exports.login = async (req, res, next) => {
  const { userName, password } = req.body;
  let existingUser;
  try {
    existingUser = await User.findAll({ where: { userName: userName } });
  } catch (error) {
    console.log(error);
    return next(new HttpError("Something went wrong, please try again", 500));
  }
  if (existingUser.length === 0) {
    return next(new HttpError("userName do not exist, please register"), 404);
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser[0].password);
  } catch (error) {
    return next(new HttpError("Could not login, please try again", 500));
  }
  if (!isValidPassword) {
    return next(new HttpError("Password is incorrect, please try again", 422));
  }
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser[0].id, userName: existingUser[0].userName },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Could not login, please try again", 500));
  }

  res.status(201).json({ user: existingUser[0], token });
};

exports.register = async (req, res, next) => {
  const { userName, name, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findAll({ where: { userName: userName } });
  } catch (error) {
    return next(new HttpError("Something went wrong, please try again", 500));
  }

  if (existingUser.length > 0) {
    return next(
      new HttpError("userName already existed, please choose another userName"),
      403
    );
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (error) {
    return next(new HttpError("could not create user, please try again", 500));
  }

  let createdUser;
  try {
    createdUser = await User.create({
      userName: userName,
      password: hashedPassword,
      image: req.file.path,
      name: name,
    });
  } catch (error) {
    return next(new HttpError("could not create user, please try again", 500));
  }
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, userName: createdUser.userName },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Could not login, please try again", 500));
  }
  let shoppingCart;
  try {
    shoppingCart = await createdUser.createShoppingCart();
  } catch (error) {
    return next(new HttpError("Could not login, please try again", 500));
  }
  res.status(201).json({ user: createdUser, token, shoppingCart });
};

exports.getCustomerData = async (req, res, next) => {
  const userId = req.params.userId;
  let user;
  try {
    user = await User.findByPk(userId);
  } catch (error) {
    return next(new HttpError("Could fetch user data, please try again", 500));
  }
  if (user) {
    const mappedData = {
      id: user.id,
      image: user.image,
      userName: user.userName,
      name: user.name,
    };
    res.json(mappedData).status(201);
  } else {
    return next(new HttpError("Could fetch user data, please try again", 500));
  }
};
