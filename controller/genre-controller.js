const HttpError = require("../models/errors");
const fs = require("fs");
const { prisma } = require("../utils/prisma");

exports.getGenres = async (req, res) => {
  try {
    const genres = await prisma.genre.findMany();
    res.json(genres).status(201);
  } catch (error) {
    new HttpError(
      "Something went wrong when fetching genres from database",
      500
    );
  }
};

exports.createAGenre = async (req, res, next) => {
  const { name } = req.body;
  try {
    const genre = await prisma.genre.create({ data: { name } });
    res.json(genre).status(201);
  } catch (error) {
    new HttpError("Something went wrong when creating a genre", 500);
  }
};
exports.editAGenre = async (req, res, next) => {
  const gid = req.params.gId;
  const { name } = req.body;
  try {
    await prisma.genre.update({ where: { id: gid }, data: { name } });
  } catch (error) {
    return new HttpError("Something went wrong when editing genre", 500);
  }
  res.json({ message: "success" }).status(201);
};
