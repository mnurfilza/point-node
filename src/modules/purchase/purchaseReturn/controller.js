const httpStatus = require('http-status');
const catchAsync = require('@src/utils/catchAsync');
const services = require('./services');

const createPurchaseReturn = catchAsync(async (req, res) => {
  const { currentTenantDatabase, user: maker, body: createPurchaseReturnDto } = req;
  const createPurchaseReturnRf = await new services.CreatePurchaseReturns(currentTenantDatabase, {
    maker,
    createPurchaseReturnDto,
  }).call();
  res.status(httpStatus.OK).send({ message: 'Success', data: createPurchaseReturnRf });
});

const findPurchaseReturns = catchAsync(async (req, res) => {
  const {
    currentTenantDatabase,
    user: maker,
    params: { purchaseReturnId },
  } = req;
  const findPurchasreReturnResponse = await new services.GetPurchaseReturn(currentTenantDatabase, {
    maker,
    purchaseReturnId,
  }).call();
  res.status(httpStatus.OK).send({ message: 'Success', data: findPurchasreReturnResponse });
});

module.exports = { createPurchaseReturn, findPurchaseReturns };
