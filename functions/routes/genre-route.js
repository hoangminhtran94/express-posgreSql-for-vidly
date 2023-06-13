const express = require("express");
const checkAuth = require("../middleware/auth");
const {
  getGenres,
  createAGenre,
  editAGenre,
} = require("../controller/genre-controller");

const genreRoute = express.Router();

genreRoute.get("/", getGenres);

genreRoute.use(checkAuth);
genreRoute.post("/", createAGenre);
genreRoute.post("/:gId", editAGenre);

module.exports = genreRoute;
