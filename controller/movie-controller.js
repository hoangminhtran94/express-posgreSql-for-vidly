const Movie = require("../models/movies");
const Genre = require("../models/genre");
const HttpError = require("../models/errors");
const CartItems = require("../models/cart-item");
const { response } = require("express");

exports.getMovies = async (req, res, next) => {
  try {
    const movies = await Movie.findAll();
    res.json(movies).status(201);
  } catch (error) {
    next(
      new HttpError(
        "Something went wrong when fetching movies from database",
        500
      )
    );
  }
};

exports.getGenres = async (req, res, next) => {
  console.log("Hello");
  try {
    const genres = await Genre.findAll();
    res.json(genres).status(201);
  } catch (error) {
    new HttpError(
      "Something went wrong when fetching genres from database",
      500
    );
  }
};

exports.addAMovie = async (req, res, next) => {
  const { title, numberInStock, dailyRentalRate, description, genreId } =
    req.body;
  console.log(req.user);
  try {
    const newMovie = await req.user.createMovie({
      title,
      numberInStock: +numberInStock,
      dailyRentalRate: +dailyRentalRate,
      description,
      genreId,
      image: req.file.path,
    });
    res.json(newMovie).status(201);
  } catch (error) {
    return next(
      new HttpError("Something went wrong when adding movies to database", 500)
    );
  }
};

exports.getMoviesByCreator = async (req, res, next) => {
  const userId = req.userId;
  if (!userId) {
    new HttpError("Unauthorized user", 403);
  }
  try {
    const movies = Movie.findAll({ where: { creator: userId } });
    res.json(movies);
  } catch (error) {
    new HttpError("Something went wrong when getting movies to database", 500);
  }
};
exports.getMoviesById = async (req, res, next) => {
  const mid = req.params.mid;
  try {
    const movie = await Movie.findByPk(mid);
    res.json(movie).status(201);
  } catch (error) {
    new HttpError("Something went wrong when getting movies to database", 500);
  }
};

exports.editAMovie = async (req, res, next) => {};

exports.deleteAMovie = async (req, res, next) => {
  const movieId = req.params.mid;

  try {
    const movie = await Movie.findByPk(movieId);
    await movie.destroy();
  } catch (error) {
    new HttpError("Something went wrong when getting movies to database", 500);
  }
};

exports.createAGenre = async (req, res, next) => {
  const { name } = req.body;
  try {
    const genre = await Genre.create({ name: name });
    res.json(genre).status(201);
  } catch (error) {
    new HttpError("Something went wrong when creating a genre", 500);
  }
};

exports.getCart = async (req, res, next) => {
  const user = req.user;
  let shoppingCart;
  try {
    shoppingCart = await user.getShoppingCart();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Could not fetch cart, please try again", 500));
  }
  if (!shoppingCart) {
    try {
      shoppingCart = await existingUser[0].createShoppingCart();
    } catch (error) {
      console.log(error);
      return next(new HttpError("Could not fetch cart, please try again", 500));
    }
  }
  let cartMovies;
  try {
    cartMovies = await shoppingCart.getMovies();
  } catch (error) {
    console.log(error);
    return next(new HttpError("Could not fetch cart, please try again", 500));
  }
  let cartItems = [];
  if (cartMovies.length > 0) {
    cartItems = cartMovies.map((movie) => movie.cartItem);
  }
  console.log(cartItems);
  res.json(cartItems).status(201);
};

exports.postCartItem = async (req, res, next) => {
  const user = req.user;
  const { movieId, quantity } = req.body;
  let shoppingCart;

  let existedMovie;
  try {
    existedMovie = await user.getMovies({ where: { id: movieId } });
  } catch (error) {
    return next(new HttpError("Could not post cart, please try again", 500));
  }
  console.log(existedMovie);
  if (existedMovie.length > 0) {
    return next(
      new HttpError("Could buy your own product, please try again", 500)
    );
  }

  try {
    shoppingCart = await user.getShoppingCart();
  } catch (error) {
    return next(new HttpError("Could not post cart, please try again", 500));
  }
  let movies;
  //Check if there's any movies in the shopping cart
  try {
    movies = await shoppingCart.getMovies({ where: { id: movieId } });
  } catch (error) {
    return next(new HttpError("Could not post cart, please try again", 500));
  }
  let movie;
  if (movies.length > 0) {
    //If movie is in the cart
    movie = movies[0];
  }
  let newQuantity = quantity;
  if (movie) {
    //new quantity = old quantity + 1
    const oldquantity = movie.cartItem.quantity;
    newQuantity = oldquantity + quantity;
    if (newQuantity === 0) {
      await movie.cartItem.destroy();
    } else {
      await shoppingCart.addMovie(movie, {
        through: { quantity: newQuantity },
      });
    }
  }

  if (!movie && newQuantity > 0) {
    try {
      movie = await Movie.findByPk(movieId);
    } catch (error) {
      return next(new HttpError("Could not post cart, please try again", 500));
    }

    try {
      await shoppingCart.addMovie(movie, {
        through: { quantity: newQuantity },
      });
    } catch (error) {
      return next(new HttpError("Could not post cart, please try again", 500));
    }
  }
  //Get the updated movie
  let updatedMovie;
  try {
    updatedMovie = await shoppingCart.getMovies({ where: { id: movieId } });
  } catch (error) {
    return next(new HttpError("Could not post cart, please try again", 500));
  }
  if (!updatedMovie[0]) {
    res.json({ message: "deleted" }).status(201);
  } else {
    res.json(updatedMovie[0].cartItem).status(201);
  }
};

exports.deleteCartItem = async (req, res, next) => {
  const cartId = req.params.cartId;
  let cartItem;
  try {
    cartItem = await CartItems.findByPk(cartId);
  } catch (error) {
    return next(new HttpError("Could not delete cart, please try again", 500));
  }
  if (!cartItem) {
    return next(new HttpError("Could not delete cart, please try again", 500));
  }

  try {
    await cartItem.destroy();
  } catch (error) {
    return next(new HttpError("Could not delete cart, please try again", 500));
  }
  res.json({ message: "Successfully deleted cart item" });
};

exports.checkout = async (req, res, next) => {
  const user = req.user;
  let shoppingCart;
  try {
    shoppingCart = await user.getShoppingCart();
  } catch (error) {
    return next(new HttpError("Could not checkout, please try again", 500));
  }
  let movies;
  try {
    movies = await shoppingCart.getMovies();
  } catch (error) {
    return next(new HttpError("Could not checkout, please try again", 500));
  }
  let order;
  try {
    order = await user.createOrder();
  } catch (error) {
    return next(new HttpError("Could not checkout, please try again", 500));
  }

  try {
    await order.addMovies(
      movies.map((movie) => {
        movie.orderItem = { quantity: movie.cartItem.quantity };
        return movie;
      })
    );
  } catch (error) {
    return next(new HttpError("Could not checkout, please try again", 500));
  }

  try {
    await shoppingCart.setMovies(null);
  } catch (error) {
    return next(new HttpError("Could not checkout, please try again", 500));
  }
  res.json({ message: "success" }).status(201);
};

exports.getOrders = async (req, res, next) => {};

exports.getCustomer = async (req, res, next) => {
  const user = req.user;
  let movies;
  try {
    movies = await user.getMovies();
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Could not fetch customer, please try again", 500)
    );
  }

  let moviesorders;
  try {
    let ordersPromises = [];
    movies.forEach((movie) => {
      ordersPromises.push(movie.getOrders());
    });
    moviesorders = await Promise.all(ordersPromises);
  } catch (error) {
    return next(
      new HttpError("Could not fetch customer, please try again", 500)
    );
  }
  let returnObject = moviesorders.reduce((Array, movieOrders) => {
    const mappedMovieOrders = movieOrders.map((order) => {
      return {
        id: order.id,
        createdAt: order.id,
        updatedAt: order.updatedAt,
        customerId: order.userId,
        quantity: order.orderItem.quantity,
        movieId: order.orderItem.movieId,
      };
    });

    return [...Array, ...mappedMovieOrders];
  }, []);

  res.json(returnObject).status(201);
};
