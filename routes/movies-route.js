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
const router = express.Router();
router.get("/", getMovies);
router.use(checkAuth).get("/your-movies", getUserMovies);
router.get("/:mid", getMoviesById);
router.get("/user/:uid", getMoviesByCreator);

//Followring routes is protected
router.use(checkAuth);
router.post("/", fileUpload.single("image"), addAMovie);
router.post("/:mid", fileUpload.single("image"), editAMovie);
router.delete("/:mid", deleteAMovie);

module.exports = router;
