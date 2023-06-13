const HttpError = require("../models/errors");
const fs = require("fs");
const { prisma } = require("../utils/prisma");

const movieController = {
  getMovies: async (req, res, next) => {
    try {
      const movies = await prisma.movie.findMany({ include: { owner: true } });
      res.json(movies).status(201);
    } catch (error) {
      next(
        new HttpError(
          "Something went wrong when fetching movies from database",
          500
        )
      );
    }
  },
  getUserMovies: async (req, res, next) => {
    const user = req.user;
    try {
      const movies = await prisma.movie.findMany({
        where: { ownerId: user.id },
      });
      res.json(movies).status(201);
    } catch (error) {
      next(
        new HttpError(
          "Something went wrong when fetching movies from database",
          500
        )
      );
    }
  },
  addAMovie: async (req, res, next) => {
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
          image: req.file.location,
          owner: { connect: { id: req.user.id } },
        },
      });
    } catch (error) {
      console.log(error);
      return next(
        new HttpError(
          "Something went wrong when adding movies to database",
          500
        )
      );
    }
    res.json(newMovie).status(201);
  },
  getMoviesByCreator: async (req, res, next) => {
    const userId = req.userId;
    if (!userId) {
      new HttpError("Unauthorized user", 403);
    }
    try {
      const movies = prisma.movie.findMany({ where: { ownerId: userId } });
      res.json(movies);
    } catch (error) {
      new HttpError(
        "Something went wrong when getting movies to database",
        500
      );
    }
  },
  getMoviesById: async (req, res, next) => {
    const mid = req.params.mid;
    try {
      const movie = await prisma.movie.findFirst({ where: { id: mid } });
      res.json(movie).status(201);
    } catch (error) {
      new HttpError(
        "Something went wrong when getting movies to database",
        500
      );
    }
  },
  editAMovie: async (req, res, next) => {
    const { title, numberInStock, dailyRentalRate, description, genreId } =
      req.body;
    const id = req.params.mid;
    let movie;
    let file;
    if (req.file) {
      file = req.file.location;
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
      console.log(error);
      return next(
        new HttpError(
          "Something went wrong when editeing movie, please try again",
          500
        )
      );
    }

    res.json({ message: "success" }).status(201);
  },

  deleteAMovie: async (req, res, next) => {
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
  },
};

module.exports = movieController;
