const HttpError = require("../models/errors");
const fs = require("fs");
const { prisma } = require("../utils/prisma");

exports.getCart = async (req, res, next) => {
  const user = req.user;
  let shoppingCart;
  try {
    shoppingCart = await prisma.shoppingCart.findFirst({
      where: { ownerId: user.id },
      include: { cartItems: { include: { movie: true } } },
    });
  } catch (error) {
    return next(new HttpError("Could not fetch cart, please try again", 500));
  }
  if (!shoppingCart) {
    try {
      shoppingCart = await prisma.shoppingCart.create({
        data: { owner: { connect: { id: user.id } } },
        include: { cartItems: { include: { movie: true } } },
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

  try {
    await prisma.$transaction(async (ctx) => {
      for (let i = 0; i < cartItems.length; i++) {
        let movie;
        try {
          movie = await ctx.movie.update({
            where: { id: cartItems[i].movieId },
            data: { numberInStock: { decrement: +cartItems[i].quantity } },
          });
        } catch (error) {
          console.log(error);
        }

        if (movie.numberInStock < 0) {
          throw new HttpError("Number in Stock not enough", 403);
        }
      }
    });
  } catch (error) {
    return next(error);
  }

  const disconnects = cartItems.map((item) => ({ id: item.id }));

  try {
    await prisma.$transaction(async (ctx) => {
      try {
        await ctx.shoppingCart.update({
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
            ctx.order.create({
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
    });
  } catch (error) {
    return next(error);
  }

  res.json({ message: "success" }).status(201);
};
