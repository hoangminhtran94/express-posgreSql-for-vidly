const HttpError = require("../models/errors");
const fs = require("fs");
const { prisma } = require("../utils/prisma");

exports.postLike = async (req, res, next) => {
  const user = req.user;
  const { mid } = req.params;
  try {
    await prisma.$transaction(async (ctx) => {
      let currentLike;
      try {
        currentLike = await ctx.movieLike.findFirst({
          where: { movieId: mid, userId: user.id },
        });
      } catch (error) {
        throw new HttpError("Something wrong happened", 403);
      }
      if (!currentLike) {
        try {
          await ctx.movieLike.create({
            data: {
              liked: true,
              movie: { connect: { id: mid } },
              user: { connect: user.id },
            },
          });
        } catch (error) {
          throw new HttpError("Something wrong happened", 403);
        }
      } else {
        try {
          await ctx.movieLike.update({
            where: { userId_movieId: { userId: user.id, movieId: mid } },
            data: { liked: !currentLike.liked },
          });
        } catch (error) {
          throw new HttpError("Something wrong happened", 403);
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};
