const HttpError = require("../models/errors");
const fs = require("fs");
const { prisma } = require("../utils/prisma");

exports.getMovies = async (req, res, next) => {
  try {
    const movies = await prisma.movie.findMany();
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

exports.getUserMovies = async (req, res, next) => {
  const user = req.user;
  try {
    const movies = await prisma.movie.findMany({ where: { ownerId: user.id } });
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

exports.addAMovie = async (req, res, next) => {
  const { title, numberInStock, dailyRentalRate, description, genreId } =
    req.body;
  let newMovie;
  try {
    newMovie = await prisma.movie.create({
      data: {
        title,
        numberInStock: +numberInStock,
        dailyRentalRate: +dailyRentalRate,
        description,
        genre: { connect: { id: genreId } },
        image: req.file.path,
        owner: { connect: { id: req.user.id } },
      },
    });
  } catch (error) {
    console.log(error);
    return next(
      new HttpError("Something went wrong when adding movies to database", 500)
    );
  }
  res.json(newMovie).status(201);
};

exports.getMoviesByCreator = async (req, res, next) => {
  const userId = req.userId;
  if (!userId) {
    new HttpError("Unauthorized user", 403);
  }
  try {
    const movies = prisma.movie.findMany({ where: { ownerId: userId } });
    res.json(movies);
  } catch (error) {
    new HttpError("Something went wrong when getting movies to database", 500);
  }
};
exports.getMoviesById = async (req, res, next) => {
  const mid = req.params.mid;
  try {
    const movie = await prisma.movie.findFirst({ where: { id: mid } });
    res.json(movie).status(201);
  } catch (error) {
    new HttpError("Something went wrong when getting movies to database", 500);
  }
};

exports.editAMovie = async (req, res, next) => {
  const { id, title, numberInStock, dailyRentalRate, description, genreId } =
    req.body;
  let movie;
  let file;
  if (req.file) {
    file = req.file.path;
  }

  try {
    movie = await prisma.movie.findFirst({ where: { id } });
  } catch (error) {
    return next(
      new HttpError(
        "Something went wrong when editeing movie, please try again",
        500
      )
    );
  }
  if (!movie) {
    return next(
      new HttpError(
        "Something went wrong when editeing movie, please try again",
        500
      )
    );
  }
  if (file) {
    fs.unlink(movie.image, (error) => {
      console.log(error);
    });
  }

  try {
    await prisma.movie.update({
      where: { id },
      data: {
        title,
        numberInStock: +numberInStock,
        dailyRentalRate: +dailyRentalRate,
        description,
        image: file ? file : movie.image,
        genre: genreId ? { connect: { id: genreId } } : undefined,
      },
    });
  } catch (error) {
    return next(
      new HttpError(
        "Something went wrong when editeing movie, please try again",
        500
      )
    );
  }

  res.json({ message: "success" }).status(201);
};

exports.deleteAMovie = async (req, res, next) => {
  const movieId = req.params.mid;

  try {
    await prisma.movie.delete({ where: { id: movieId } });
  } catch (error) {
    return new HttpError(
      "Something went wrong when getting movies to database",
      500
    );
  }
  res.json({ message: "success" }).status(201);
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
  // let genre;
  // try {
  //   genre = await prisma.genre.findFirst({ where: { id: gid } });
  // } catch (error) {
  //   return new HttpError("Something went wrong when editing genre", 500);
  // }
  // if (!genre) {
  //   return new HttpError("Genre not available", 500);
  // }

  try {
    await prisma.genre.update({ where: { id: gid }, data: { name } });
  } catch (error) {
    return new HttpError("Something went wrong when editing genre", 500);
  }
  res.json({ message: "success" }).status(201);
};

exports.getCart = async (req, res, next) => {
  const user = req.user;
  let shoppingCart;
  try {
    shoppingCart = await prisma.shoppingCart.findFirst({
      where: { ownerId: user.id },
      include: { cartItems: true },
    });
  } catch (error) {
    return next(new HttpError("Could not fetch cart, please try again", 500));
  }
  if (!shoppingCart) {
    try {
      shoppingCart = await prisma.shoppingCart.create({
        data: { owner: { connect: { id: user.id } } },
        include: { cartItems: true },
      });
    } catch (error) {
      return next(new HttpError("Could not fetch cart, please try again", 500));
    }
  }

  res.json(shoppingCart.cartItems).status(201);
};

exports.postCartItem = async (req, res, next) => {
  const user = req.user;
  const { movieId, quantity } = req.body;
  let shoppingCart;
  let existedMovie;
  try {
    existedMovie = await prisma.movie.findFirst({
      where: { id: movieId, ownerId: user.id },
    });
  } catch (error) {
    return next(new HttpError("Could not post cart, please try again", 500));
  }
  if (existedMovie) {
    return next(
      new HttpError("Could buy your own product, please try again", 500)
    );
  }

  try {
    shoppingCart = await prisma.shoppingCart.findFirst({
      where: { ownerId: user.id },
      include: { cartItems: true },
    });
  } catch (error) {
    return next(new HttpError("Could not post cart, please try again", 500));
  }
  // let movies;
  // //Check if there's any movies in the shopping cart
  // try {
  //   movies = await shoppingCart.getMovies({ where: { id: movieId } });
  // } catch (error) {
  //   return next(new HttpError("Could not post cart, please try again", 500));
  // }
  let currentMovie;
  try {
    currentMovie = await prisma.movie.findFirst({ where: { id: movieId } });
  } catch (error) {
    return next(new HttpError("Could not post cart, please try again", 500));
  }
  if (!currentMovie) {
    return next(new HttpError("Movie not found", 500));
  }

  let movieInCart;
  if (shoppingCart.cartItems.length > 0) {
    //If movie is in the cart
    movieInCart = shoppingCart.cartItems.find(
      (item) => item.movieId === movieId
    );
  }

  let newQuantity = quantity;

  if (movieInCart) {
    //new quantity = old quantity + 1
    const oldquantity = movieInCart.quantity;
    newQuantity = oldquantity + quantity;
    if (newQuantity === 0) {
      try {
        await prisma.cartItem.delete({
          where: { id: movieInCart.id },
        });
        movieInCart = null;
      } catch {
        return next(
          new HttpError("Could not post cart, please try again", 500)
        );
      }
    } else {
      try {
        await prisma.cartItem.update({
          where: {
            id: movieInCart.id,
          },
          data: {
            quantity: newQuantity,
          },
        });
      } catch (e) {
        return next(
          new HttpError("Could not post cart, please try again", 500)
        );
      }
    }
  }

  if (!movieInCart && newQuantity > 0) {
    try {
      movieInCart = await prisma.cartItem.create({
        data: {
          movie: { connect: { id: movieId } },
          quantity: newQuantity,
          shoppingCart: { connect: { id: shoppingCart.id } },
        },
        include: { movie: true, shoppingCart: true },
      });
    } catch (error) {
      return next(new HttpError("Could not post cart, please try again", 500));
    }
  }
  //Get the updated movie

  if (!movieInCart) {
    res.json({ message: "deleted" }).status(201);
  } else {
    res.json(movieInCart).status(201);
  }
};

exports.deleteCartItem = async (req, res, next) => {
  const cartId = req.params.cartId;
  try {
    await prisma.cartItem.delete({ where: { id: cartId } });
  } catch (error) {
    return next(new HttpError("Could not delete cart, please try again", 500));
  }

  res.json({ message: "Successfully deleted cart item" });
};

exports.checkout = async (req, res, next) => {
  const user = req.user;
  let shoppingCart;
  try {
    shoppingCart = await prisma.shoppingCart.findFirst({
      where: { ownerId: user.id },
    });
  } catch (error) {
    return next(new HttpError("Could not checkout, please try again", 500));
  }
  let cartItems;
  try {
    cartItems = await prisma.cartItem.findMany({
      where: { shoppingCartId: shoppingCart.id },
      include: { movie: { select: { ownerId: true } } },
    });
  } catch (error) {
    return next(new HttpError("Could not checkout, please try again", 500));
  }

  if (cartItems === 0) {
    return next(new HttpError("There's no items", 500));
  }
  const disconnects = cartItems.map((item) => ({ id: item.id }));

  try {
    await prisma.shoppingCart.update({
      where: { id: shoppingCart.id },
      data: { cartItems: { delete: disconnects } },
    });
  } catch (error) {
    return next(new HttpError("Could not checkout, please try again", 500));
  }
  try {
    let promises = [];
    cartItems.forEach((item) => {
      promises.push(
        prisma.order.create({
          data: {
            shoppingCart: { connect: { id: shoppingCart.id } },
            user: { connect: { id: item.movie.ownerId } },
            orderItems: {
              create: {
                quantity: item.quantity,
                movie: { connect: { id: item.movieId } },
              },
            },
          },
        })
      );
    });
    await Promise.all(promises);
  } catch (error) {
    return next(new HttpError("Could not checkout, please try again", 500));
  }

  res.json({ message: "success" }).status(201);
};

exports.getOrders = async (req, res, next) => {
  const user = req.user;
  let orders;
  try {
    await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        orderItems: { include: { movie: true } },
        shoppingCart: { include: { owner: true } },
      },
    });
  } catch (error) {
    return next(new HttpError("Something went wrong, please try again", 500));
  }

  res.json(orders).status(201);
};

exports.getCustomer = async (req, res, next) => {
  const user = req.user;
  let orders;
  try {
    orders = await prisma.order.findMany({
      where: { userId: user.id },
      include: {
        orderItems: { include: { movie: true } },
        shoppingCart: { select: { owner: true } },
      },
    });
  } catch (error) {
    return next(new HttpError("Something went wrong, please try again", 500));
  }

  res.json(orders).status(201);
};
