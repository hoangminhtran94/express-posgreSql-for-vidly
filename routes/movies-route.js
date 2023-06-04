const express = require("express");
const {
  getMovies,
  getUserMovies,
  addAMovie,
  getMoviesByCreator,
  getMoviesById,
  editAMovie,
  deleteAMovie,
  createAGenre,
  getGenres,
  getCart,
  postCartItem,
  checkout,
  getCustomer,
  deleteCartItem,
  editAGenre,
} = require("../controller/movie-controller");
const checkAuth = require("../middleware/auth");
const { fileUpload } = require("../middleware/file-upload");
const router = express.Router();
router.get("/", getMovies);
router.get("/genre", getGenres);
router.use(checkAuth).get("/your-movies", getUserMovies);
router.get("/:mid", getMoviesById);
router.get("/user/:uid", getMoviesByCreator);

//Followring routes is protected
router.use(checkAuth);
router.post("/", fileUpload.single("image"), addAMovie);
router.post("/cart", postCartItem);
router.get("/cart/getCart", getCart);
router.delete("/cart/:cartId", deleteCartItem);
router.post("/genre", createAGenre);
router.post("/genre/:gId", editAGenre);
router.post("/checkout", checkout);

router.post("/edit", fileUpload.single("image"), editAMovie);
router.delete("/:mid", deleteAMovie);

module.exports = router;
