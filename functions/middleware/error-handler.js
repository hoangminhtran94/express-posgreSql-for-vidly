const fs = require("fs");

const errorHandler = (error, req, res, next) => {
  console.log(error);
  if (req.file) {
    fs.unlink(req.file.path, (error) => {
      console.log(error);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occured!" });
};

module.exports = errorHandler;
