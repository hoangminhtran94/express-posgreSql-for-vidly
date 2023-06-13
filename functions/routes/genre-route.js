const express = require("express");
const checkAuth = require("../middleware/auth");
const {
  getGenres,
  createAGenre,
  editAGenre,
} = require("../controller/genre-controller");

const route = express.Router();

route.get("/", getGenres);

route.use(checkAuth);
route.post("/", createAGenre);
route.post("/:gId", editAGenre);

module.exports = route;
