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

  const data = await new services.GetPurchaseReturn(currentTenantDatabase, {
    maker,
    purchaseReturnId,
  }).call();
  res.status(httpStatus.OK).send({ message: 'Success', data });
});

const findAllPurchaseReturns = catchAsync(async (req, res) => {
  const { currentTenantDatabase, query: queries } = req;
  const { data, maxItem, currentPage, totalPage, total } = await new services.GetListPurchaseReturn(
    currentTenantDatabase,
    queries
  ).call();
  res.status(httpStatus.OK).send({
    data,
    meta: {
      current_page: currentPage,
      last_page: totalPage,
      per_page: maxItem,
      total,
    },
  });
});

const deletePurchaseReturn = catchAsync(async (req, res) => {
  const {
    currentTenantDatabase,
    user: maker,
    body: requestDeleteDto,
    params: { purchaseReturnId },
  } = req;

  const deletePurchaseReturnUsecase = await new services.DeletePurchaseReturn(currentTenantDatabase, {
    maker,
    requestDeleteDto,
    purchaseReturnId,
  }).call();

  res.status(204).send({ message: 'Success', deletePurchaseReturnUsecase });
});

const updatePurchaseReturns = catchAsync(async (req, res) => {
  const {
    currentTenantDatabase,
    user: maker,
    body: updatePurchaseReturn,
    params: { purchaseReturnId },
  } = req;
  const updatePrt = await new services.UpdatePurchaseReturn(currentTenantDatabase, {
    maker,
    updatePurchaseReturn,
    purchaseReturnId,
  }).call();
  res.status(httpStatus.OK).send({ message: 'Success', updatePrt });
});
module.exports = {
  createPurchaseReturn,
  findPurchaseReturns,
  findAllPurchaseReturns,
  deletePurchaseReturn,
  updatePurchaseReturns,
};
