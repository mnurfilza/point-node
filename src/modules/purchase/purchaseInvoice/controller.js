const httpStatus = require('http-status');
const catchAsync = require('@src/utils/catchAsync');
const apiServices = require('./services/apis');

const findAll = catchAsync(async (req, res) => {
  console.log('test');
  const { currentTenantDatabase, query: queries } = req;
  const { purchaseInvoices } = await new apiServices.FindAll(currentTenantDatabase, queries).call();
  res.status(httpStatus.OK).send({
    data: purchaseInvoices,
  });
});

module.exports = {
  findAll,
};
