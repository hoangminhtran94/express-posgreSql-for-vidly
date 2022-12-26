const Sequelize = require("sequelize");
const db = require("../utils/database");

const Order = db.define("order", {
  id: {
    type: Sequelize.DataTypes.UUID,
    defaultValue: Sequelize.DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = Order;
