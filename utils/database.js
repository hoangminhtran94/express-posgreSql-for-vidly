const pg = require("pg");
const { Sequelize } = require("sequelize");

const db = new Sequelize("vidly", "postgres", "Talatrum@007", {
  dialect: "postgres",
  host: "localhost",
  port: "8080",
});

module.exports = db;
