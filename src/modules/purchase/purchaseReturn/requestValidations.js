const { Joi } = require('celebrate');

const requireAuth = {
  headers: Joi.object({
    authorization: Joi.string().required(),
  }).unknown(true),
};

const createPurchaseReturn = {
  body: Joi.object({
    items: Joi.array().items({
      purchaseInvoiceItemId: Joi.number().required(),
      itemId: Joi.number().required(),
      itemName: Joi.string().required(),
      qtyInvoice: Joi.number().required(),
      qtyReturn: Joi.number().required(),
      unitConverterInvoice: Joi.string().required(),
      unitConverterReturn: Joi.string().required(),
      converter: Joi.number().required(),
      price: Joi.number().required(),
      discountPercent: Joi.number().allow(null),
      disc: Joi.number().required(),
      total: Joi.number().required(),
      allocationId: Joi.number().allow(null),
      expiryDate: Joi.date().iso().allow(null),
      productionNumber: Joi.string().allow(null),
    }),
    supplierId: Joi.number().required(),
    warehouseId: Joi.number().required(),
    supplierName: Joi.string().required(),
    subTotal: Joi.number().required(),
    taxbase: Joi.number().required(),
    tax: Joi.number().required(),
    total: Joi.number().required(),
    notes: Joi.string().allow(null).max(255),
    approver: Joi.number().required(),
    approverName: Joi.string(),
    approverEmail: Joi.string().required(),
    purchaseInvoiceId: Joi.number().required(),
  }),
};
module.exports = {
  requireAuth,
  createPurchaseReturn,
};
