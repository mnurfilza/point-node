const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');
const { Op } = require('sequelize');

class UpdatePurchaseReturn {
  constructor(tenantDatabase, { maker, updatePurchaseReturn, purchaseReturnId }) {
    this.tenantDatabase = tenantDatabase;
    this.maker = maker;
    this.updatePurchaseReturn = updatePurchaseReturn;
    this.purchaseReturnId = purchaseReturnId;
  }

  // eslint-disable-next-line no-empty-function
  async call() {
    const { id, form, approver, items, supplierName, supplierId, tax, purchaseInvoiceId, warehouseId, amount, remaining } =
      this.updatePurchaseReturn;
    await validate(this.purchaseReturnId, this.tenantDatabase, this.maker, this.updatePurchaseReturn);

    this.tenantDatabase.sequelize.transaction(async (transaction) => {
      const promisedAll = [];
      await this.tenantDatabase.UserActivities.create(
        {
          number: form.number,
          tableId: id,
          tableType: 'PurchaseReturn',
          activity: await getActivityIncrement(this.tenantDatabase, form),
        },
        { transaction }
      );

      // update form
      const prtReturin = await this.tenantDatabase.PurchaseReturn.create({
        purchaseInvoiceId,
        warehouseId,
        supplierId,
        supplierName,
        tax,
        amount,
        remaining,
      });

      await UpdateFormPurchaseReturn(prtReturin, this.tenantDatabase, form, approver);
      items.forEach((val) => {
        promisedAll.push(
          this.tenantDatabase.PurchaseReturnItems.create(
            {
              purchaseReturnId: prtReturin.id,
              purchaseInvoiceItemId: val.purchaseInvoiceItemId,
              itemId: val.itemId,
              itemName: val.itemName,
              quantity: val.qtyReturn,
              quantityInvoice: val.qtyInvoice,
              price: val.price,
              discountValue: val.disc,
              discountPercent: val.discountPercent,
              unit: val.unitConverterReturn,
              notes: val.notes,
              converter: val.converter,
              allocationId: val.allocationId,
              ...(val.expiryDate && { expiryDate: val.expiryDate }),
              ...(val.productionNumber && { productionNumber: val.productionNumber }),
            },
            { transaction }
          )
        );
      });

      await Promise.all(promisedAll).catch((e) => {
        throw new ApiError(httpStatus.BAD_GATEWAY, `${e}`);
      });
    });
  }
}

function getMonthFormattedString(currentDate) {
  const month = currentDate.getMonth() + 1;
  return `0${month}`.slice(-2);
}

async function getFormIncrement(tenantDatabase, currentDate) {
  const incrementGroup = `${currentDate.getFullYear()}${getMonthFormattedString(currentDate)}`;
  const lastForm = await tenantDatabase.Form.findOne({
    where: {
      formableType: 'PurchaseReturn',
      incrementGroup,
    },
    order: [['increment', 'DESC']],
  });

  return {
    incrementGroup,
    incrementNumber: lastForm ? lastForm.incrementNumber + 1 : 1,
  };
}
function padTo2Digits(num) {
  return num.toString().padStart(2, '0');
}

function formatDate(date) {
  return [padTo2Digits(date.getMonth() + 1), padTo2Digits(date.getDate()), date.getFullYear()].join('/');
}

async function validate(purchaseReturnId, tenantDatabase, maker, updatePurchaseReturn) {
  const { items, purchaseInvoiceId, subTotal, taxbase, tax, warehouseId } = updatePurchaseReturn;
  if (purchaseInvoiceId === null) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'The given data was invalid.');
  }

  const promisedAll = [];
  const rolePermissions = await tenantDatabase.RoleHasPermission.findAll({ where: { role_id: maker.modelHasRole.roleId } });
  rolePermissions.forEach((val) => {
    promisedAll.push(tenantDatabase.Permission.findOne({ where: { id: val.permissionId } }));
  });

  const permision = await Promise.all(promisedAll).then(async (res) => {
    return res.some((val) => val.name === 'update purchase return');
  });

  if (!permision) {
    throw new ApiError(httpStatus.FORBIDDEN, 'There is no permission named `create purchase return` for guard `api`.');
  }

  const purhcaseRt = await tenantDatabase.PurchaseReturn.findOne({
    where: { id: purchaseReturnId },
    include: [{ model: tenantDatabase.Form, as: 'form' }],
  });

  if (purhcaseRt.form.done) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "Can't update, form already done!");
  }

  let disc = 0;

  // eslint-disable-next-line no-restricted-syntax
  for (const item of items) {
    if (item.qtyReturn > item.qtyInvoice) {
      throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, "Purchase return item qty can't exceed purchase invoice qty");
    }
    const countTotal = item.qtyReturn * item.price - item.disc;
    if (countTotal !== item.total) {
      throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Total Amount was invalid. ');
    }

    disc += item.disc;
  }
  const countTaxBase = subTotal - disc;
  if (countTaxBase !== taxbase) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'TaxBase Amount was invalid.');
  }
  // check tax
  const expectTax = (taxbase * 10) / 100;
  if (expectTax !== tax) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'The tax was invalid.');
  }
  // check status purchase invoice
  if (purchaseInvoiceId === null) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'The given data was invalid.');
  }

  const journalNotSet = tenantDatabase.SettingJournal.findOne({ where: { feature: 'purchase', name: 'account payable' } });
  if (journalNotSet === null) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'Journal purchase account - account payable not found.');
  }

  const warehouse = await tenantDatabase.Warehouse.findOne({
    where: { id: warehouseId },
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

async function getActivityIncrement(tenantDatabase, form) {
  let userAct = await tenantDatabase.UserActivities.count({
    where: { number: form.number, activity: { [Op.like]: '%Update%' } },
  });
  userAct += 1;
  return `Update - ${userAct}`;
}

async function UpdateFormPurchaseReturn(prtReturn, tenantDatabase, form, approver, maker) {
  const currentDate = new Date(Date.now());
  const { incrementNumber, incrementGroup } = await getFormIncrement(this.tenantDatabase, currentDate);
  await tenantDatabase.sequelize.transaction(async (transaction) => {
    await this.tenantDatabase.Form.create(
      {
        date: formatDate(currentDate),
        branchId: maker.branchId,
        number: form.number,
        done: 0,
        approvalStatus: 0,
        createdAt: currentDate,
        notes: form.notes,
        createdBy: maker.id,
        updatedBy: maker.id,
        incrementNumber,
        incrementGroup,
        formableId: prtReturn.id,
        formableType: 'PurchaseReturn',
        requestApprovalTo: approver,
      },
      { transaction }
    );
    await tenantDatabase.Form.update({
      where: { editedNumber: form.number, number: null },
    });
  });
}
module.exports = UpdatePurchaseReturn;
