const Sequelize = require("sequelize");
const db = require("../utils/database");

const OrderUser = db.define("orderUser", {
  id: {
    type: Sequelize.INTEGER,
    autoIncrement: true,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = OrderUser;
