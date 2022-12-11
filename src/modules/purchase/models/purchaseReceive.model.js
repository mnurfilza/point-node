const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes, projectCode) => {
  class PurchaseReceive extends Model {
    static associate({ [projectCode]: models }) {
      this.belongsTo(models.Supplier, { as: 'supplier', foreignKey: 'supplierId' });
      this.belongsTo(models.Warehouse, { as: 'warehouse', foreignKey: 'warehouseId' });
      this.hasMany(models.PurchaseInvoiceItem, { as: 'purchaseInvoiceItems', foreignKey: 'purchaseReceiveId' });
      this.hasOne(models.Form, {
        as: 'form',
        foreignKey: 'formableId',
        constraints: false,
        scope: { formable_type: 'PurchaseReceive' },
      });
    }
  }
  PurchaseReceive.init(
    {
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
      billingAddress: {
        type: DataTypes.STRING,
      },
      billingPhone: {
        type: DataTypes.STRING,
      },
      billingEmail: {
        type: DataTypes.STRING,
      },
      shippingAddress: {
        type: DataTypes.STRING,
      },
      shippingPhone: {
        type: DataTypes.STRING,
      },
      shippingEmail: {
        type: DataTypes.STRING,
      },
      warehouseId: {
        type: DataTypes.INTEGER,
      },
      warehouseName: {
        type: DataTypes.STRING,
      },
      purchaseOrderId: {
        type: DataTypes.INTEGER,
      },
      driver: {
        type: DataTypes.STRING,
      },
      licensePlate: {
        type: DataTypes.STRING,
      },
    },
    {
      hooks: {},
      sequelize,
      modelName: 'PurchaseReceive',
      tableName: 'purchase_receives',
      underscored: true,
      timestamps: false,
    }
  );
  return PurchaseReceive;
};
