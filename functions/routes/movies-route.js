const express = require("express");
const {
  getMovies,
  getUserMovies,
  addAMovie,
  getMoviesByCreator,
  getMoviesById,
  editAMovie,
  deleteAMovie,
} = require("../controller/movie-controller");
const checkAuth = require("../middleware/auth");
const { fileUpload } = require("../middleware/file-upload");
const movieRoute = express.Router();
movieRoute.get("/", getMovies);
movieRoute.use(checkAuth).get("/your-movies", getUserMovies);
movieRoute.get("/:mid", getMoviesById);
movieRoute.get("/user/:uid", getMoviesByCreator);

//Followring routes is protected
movieRoute.use(checkAuth);
movieRoute.post("/", fileUpload.single("image"), addAMovie);
movieRoute.post("/:mid", fileUpload.single("image"), editAMovie);
movieRoute.delete("/:mid", deleteAMovie);

module.exports = movieRoute;
