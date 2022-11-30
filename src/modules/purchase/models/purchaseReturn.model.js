const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes, projectCode) => {
  class PurchaseReturn extends Model {
    static associate({ [projectCode]: models }) {
      this.belongsTo(models.PurchaseInvoice, { as: 'purchaseInvoice', foreignKey: 'purchaseInvoiceId' });
      this.belongsTo(models.Warehouse, { as: 'warehouse', foreignKey: 'warehouseId' });
      this.belongsTo(models.Supplier, { as: 'supplier', foreignKey: 'supplierId' });

      this.hasOne(models.Form, {
        as: 'form',
        foreignKey: 'formableId',
        constraints: false,
        scope: { formable_type: 'PurchaseReturn' },
      });
    }
  }
  PurchaseReturn.init(
    {
      purchaseInvoiceId: {
        type: DataTypes.INTEGER,
      },
      warehouseId: {
        type: DataTypes.INTEGER,
      },
      supplierId: {
        type: DataTypes.INTEGER,
      },
      supplierName: {
        type: DataTypes.STRING,
      },
      supplierAddress: {
        type: DataTypes.STRING,
      },
      supplierPhone: {
        type: DataTypes.STRING,
      },
      tax: {
        type: DataTypes.DECIMAL,
      },
      amount: {
        type: DataTypes.DECIMAL,
      },
      remaining: {
        type: DataTypes.DECIMAL,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'PurchaseReturn',
      tableName: 'purchase_returns',
      underscored: true,
      timestamps: false,
    }
  );
  return PurchaseReturn;
};
