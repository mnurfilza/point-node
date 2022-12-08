const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');

class DeletePurchaseReturn {
  constructor(tenantDatabase, { maker, deletePurchaseReturn, purchaseReturnId }) {
    this.tenantDatabase = tenantDatabase;
    this.maker = maker;
    this.deletePurchaseReturn = deletePurchaseReturn;
    this.purchaseReturnId = purchaseReturnId;
  }

  async call() {
    const { reasons } = this.deletePurchaseReturn;
    await validate(this.tenantDatabase, this.purchaseReturnId, reasons);
  }
}

async function validate(tenantDatabase, prtId, reason, maker) {
  const purhcaseRt = await tenantDatabase.PurchaseReturn.findOne({
    where: { id: prtId },
    include: [{ model: this.tenantDatabase.Form, as: 'form' }],
  });

  if (purhcaseRt.form.done) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "Can't delete, form already done!");
  }

  if (reason === '') {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'The given data was invalid.');
  }

  if (maker.modelHasRole == null) {
    throw new ApiError(httpStatus.FORBIDDEN, 'There is no permission named `create purchase return` for guard `api`.');
  }

  const promisedAll = [];
  const rolePermissions = await tenantDatabase.RoleHasPermission.findAll({ where: { role_id: maker.modelHasRole.roleId } });
  rolePermissions.forEach((val) => {
    promisedAll.push(tenantDatabase.Permission.findOne({ where: { id: val.permissionId } }));
  });

  const permision = await Promise.all(promisedAll).then(async (res) => {
    return res.some((val) => val.name === 'create purchase return');
  });

  if (!permision) {
    throw new ApiError(httpStatus.FORBIDDEN, 'There is no permission named `create purchase return` for guard `api`.');
  }

  const warehouse = await this.tenantDatabase.Warehouse.findOne({
    where: { id: purhcaseRt.warehouse_id },
  });

  const isDefault = await tenantDatabase.BranchUser.findOne({
    where: { userId: maker.id, branchId: warehouse.branchId },
  });

  if (!isDefault) {
    throw new ApiError(httpStatus.NOT_FOUND, `user doesnt have branch`);
  }

  if (!isDefault.isDefault) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'please set default branch to create this form');
  }
}
module.exports = DeletePurchaseReturn;
