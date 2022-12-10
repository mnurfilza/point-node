const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');

class DeletePurchaseReturn {
  constructor(tenantDatabase, { maker, requestDeleteDto, purchaseReturnId }) {
    this.tenantDatabase = tenantDatabase;
    this.maker = maker;
    this.requestDeleteDto = requestDeleteDto;
    this.purchaseReturnId = purchaseReturnId;
  }

  async call() {
    const currentDate = new Date(Date.now());
    const { reasons } = this.requestDeleteDto;

    await validate(this.tenantDatabase, this.purchaseReturnId, reasons, this.maker);
    const getApprover = await this.tenantDatabase.Form.findOne({
      where: { formableId: this.purchaseReturnId },
    });
    const delReturn = await this.tenantDatabase.Form.update(
      {
        cancellationStatus: 0,
        requestCancellationReason: reasons,
        requestCancellationTo: getApprover.requestApprovalTo,
        requestCancellationBy: this.maker.id,
        requestCancellationAt: currentDate,
      },
      { where: { formableId: this.purchaseReturnId } }
    );
    return delReturn;
  }
}

async function validate(tenantDatabase, prtId, reason, maker) {
  const purhcaseRt = await tenantDatabase.PurchaseReturn.findOne({
    where: { id: prtId },
    include: [{ model: tenantDatabase.Form, as: 'form' }],
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

  const warehouse = await tenantDatabase.Warehouse.findOne({
    where: { id: purhcaseRt.warehouseId },
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
