const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes, projectCode) => {
  class PurchaseReturnItems extends Model {
    static associate({ [projectCode]: models }) {
      this.belongsTo(models.PurchaseReturn, { as: 'purchaseReturn', foreignKey: 'purchaseReturnId' });
    }
  }

  PurchaseReturnItems.init(
    {
      purchaseReturnId: {
        type: DataTypes.INTEGER,
      },
      itemId: {
        type: DataTypes.INTEGER,
      },
      itemName: {
        type: DataTypes.STRING,
      },
      quantity: {
        type: DataTypes.DECIMAL,
      },
      price: {
        type: DataTypes.DECIMAL,
      },
      discountPercent: {
        type: DataTypes.DECIMAL,
      },
      discountValue: {
        type: DataTypes.DECIMAL,
      },
      unit: {
        type: DataTypes.STRING,
      },
      converter: {
        type: DataTypes.DECIMAL,
      },
      notes: {
        type: DataTypes.STRING,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'PurchaseReturnItems',
      tableName: 'purchase_return_items',
      underscored: true,
      timestamps: false,
    }
  );
  return PurchaseReturnItems;
};
