const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes, projectCode) => {
  class PurchaseInvoiceItem extends Model {
    static associate({ [projectCode]: models }) {
      this.belongsTo(models.PurchaseInvoice, { as: 'purchaseInvoice', foreignKey: 'purchaseInvoiceId' });
      this.belongsTo(models.PurchaseReceive, { as: 'purchaseReceive', foreignKey: 'purchaseReceiveId' });
      this.hasMany(models.PurchaseReturnItems, { as: 'purchaseReturnItems', foreignKey: 'purchaseInvoiceItemId' });
    }
  }

  PurchaseInvoiceItem.init(
    {
      purchaseInvoiceId: {
        type: DataTypes.INTEGER,
      },
      purchaseReceiveId: {
        type: DataTypes.INTEGER,
      },
      purchaseReceiveItemId: {
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
      taxable: {
        type: DataTypes.INTEGER,
      },
      allocationId: {
        type: DataTypes.INTEGER,
      },
      expiryDate: {
        type: DataTypes.DATE,
      },
      productionNumber: {
        type: DataTypes.STRING,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'PurchaseInvoiceItem',
      tableName: 'purchase_invoice_items',
      underscored: true,
      timestamps: false,
    }
  );
  return PurchaseInvoiceItem;
};
