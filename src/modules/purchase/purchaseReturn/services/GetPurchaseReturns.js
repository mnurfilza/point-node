const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');

class GetPurchaseReturns {
  constructor(tenantDatabase, { maker, purchaseReturnId }) {
    this.tenantDatabase = tenantDatabase;
    this.maker = maker;
    this.purchaseReturnId = purchaseReturnId;
  }

  async call() {
    await validate(this.tenantDatabase, this.maker);

    const purhcaseRt = await this.tenantDatabase.PurchaseReturn.findOne({
      where: { id: this.purchaseReturnId },
      include: [
        { model: this.tenantDatabase.Form, as: 'form' },
        { model: this.tenantDatabase.PurchaseReturnItems, as: 'items' },
      ],
    });
    return purhcaseRt;
  }
}

async function validate(tenantDatabase, maker) {
  const isDefault = await tenantDatabase.BranchUser.findOne({
    where: { user_id: maker.id, branch_id: maker.branchId },
  });

  if (!isDefault) {
    throw new ApiError(httpStatus.NOT_FOUND, `user doesnt have branch`);
  }

  if (!isDefault.is_default) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'please set default branch to create this form');
  }
  const promisedAll = [];
  const rolePermissions = await tenantDatabase.RoleHasPermission.findAll({ where: { role_id: maker.modelHasRole.roleId } });
  rolePermissions.forEach((val) => {
    promisedAll.push(tenantDatabase.Permission.findOne({ where: { id: val.permissionId } }));
  });

  const permision = await Promise.all(promisedAll).then(async (res) => {
    return res.some((val) => val.name === 'read purchase return');
  });

  if (!permision) {
    throw new ApiError(httpStatus.FORBIDDEN, 'There is no permission named `create purchase return` for guard `api`.');
  }
}

module.exports = GetPurchaseReturns;
