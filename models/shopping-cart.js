const Sequelize = require("sequelize");
const db = require("../utils/database");

const ShoppingCart = db.define("shoppingCart", {
  id: {
    type: Sequelize.DataTypes.UUID,
    defaultValue: Sequelize.DataTypes.UUIDV4,
    allowNull: false,
    primaryKey: true,
  },
});

module.exports = ShoppingCart;
