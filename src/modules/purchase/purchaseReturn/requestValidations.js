const { Joi } = require('celebrate');

const requireAuth = {
  headers: Joi.object({
    authorization: Joi.string().required(),
  }).unknown(true),
};

const createPurchaseReturn = {
  body: Joi.object({
    items: Joi.array().items({
      id: Joi.number().required(),
      item: Joi.string().required(),
      qtyInvoice: Joi.number().required(),
      qtyReturn: Joi.number().required(),
      unitConverterInvoice: Joi.string().required(),
      unitConverterReturn: Joi.string().required(),
      price: Joi.number().required(),
      disc: Joi.number().required(),
      total: Joi.number().required(),
      allocation: Joi.string().required(),
    }),
    supplierId: Joi.string().required(),
    supplierName: Joi.string().required(),
    subTotal: Joi.number().required(),
    taxbase: Joi.number().required(),
    tax: Joi.number().required(),
    total: Joi.number().required(),
    notes: Joi.string().max(255),
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
