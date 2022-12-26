const express = require("express");
const {
  getMovies,
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
} = require("../controller/movie-controller");
const checkAuth = require("../middleware/auth");
const { fileUpload } = require("../middleware/file-upload");
const router = express.Router();

router.get("/", getMovies);
router.get("/genre", getGenres);
router.get("/:mid", getMoviesById);
router.get("/user/:uid", getMoviesByCreator);

router.use(checkAuth);
router.post("/", fileUpload.single("image"), addAMovie);
router.get("/cart/getCart", getCart);
router.post("/genre", createAGenre);
router.post("/cart", postCartItem);
router.delete("/cart/:cartId", deleteCartItem);
router.post("/checkout", checkout);
router.post("/customer", getCustomer);
router.patch("/:mid", editAMovie);
router.delete("/:mid", deleteAMovie);

module.exports = router;
