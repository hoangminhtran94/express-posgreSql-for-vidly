const bcrypt = require("bcryptjs");
const { prisma } = require("../utils/prisma");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const HttpError = require("../models/errors");

exports.login = async (req, res, next) => {
  const { userName, password } = req.body;
  let existingUser;
  try {
    existingUser = await prisma.user.findFirst({
      where: { username: userName },
    });
  } catch (error) {
    return next(new HttpError("Something went wrong, please try again", 500));
  }
  if (!existingUser) {
    return next(new HttpError("user not found, please register"), 404);
  }
  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (error) {
    return next(new HttpError("Could not login, please try again", 500));
  }
  if (!isValidPassword) {
    return next(new HttpError("Password is incorrect, please try again", 422));
  }
  let token;
  try {
    token = jwt.sign(
      { userId: existingUser.id, userName: existingUser.username },
      // eslint-disable-next-line no-undef
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Could not login, please try again", 500));
  }

  res.status(201).json({ user: existingUser, token });
};

exports.register = async (req, res, next) => {
  const { userName, name, password } = req.body;

  let existingUser;
  try {
    existingUser = await prisma.user.findFirst({
      where: { username: userName },
    });
  } catch (error) {
    return next(new HttpError("Something went wrong, please try again", 500));
  }

  if (existingUser) {
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
    createdUser = await prisma.user.create({
      data: {
        username: userName,
        password: hashedPassword,
        image: req.file.path,
        name: name,
        shoppingCart: { create: {} },
      },
      include: { shoppingCart: true },
    });
  } catch (error) {
    console.log(error);
    return next(new HttpError("could not create user, please try again", 500));
  }
  let token;
  try {
    token = jwt.sign(
      { userId: createdUser.id, userName: createdUser.username },
      // eslint-disable-next-line no-undef
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
  } catch (error) {
    return next(new HttpError("Could not login, please try again", 500));
  }

  res
    .status(201)
    .json({ user: createdUser, token, shoppingCart: createdUser.shoppingCart });
};

exports.getCustomerData = async (req, res, next) => {
  const userId = req.params.userId;
  let user;
  try {
    user = await prisma.user.findFirst({ where: { id: userId } });
  } catch (error) {
    return next(new HttpError("Could fetch user data, please try again", 500));
  }
  if (user) {
    return res.json(user).status(201);
  }
  return next(new HttpError("Could fetch user data, please try again", 500));
};

exports.validateToken = async (req, res) => {
  const user = req.user;
  return res.json(user).status(201);
};
