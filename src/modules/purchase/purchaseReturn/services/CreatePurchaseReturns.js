const httpStatus = require('http-status');
const ApiError = require('@src/utils/ApiError');

class CreatePurchaseReturns {
  constructor(tenantDatabase, { maker, createPurchaseReturnDto }) {
    this.tenantDatabase = tenantDatabase;
    this.maker = maker;
    this.createPurchaseReturnDto = createPurchaseReturnDto;
  }

  // eslint-disable-next-line no-empty-function
  async call() {
    const { items, supplierName, supplierId, tax, notes, approver, purchaseInvoiceId } = this.createPurchaseReturnDto;
    const currentDate = new Date(Date.now());
    await validate(this.tenantDatabase, this.maker, this.createPurchaseReturnDto);
    // eslint-disable-next-line no-console
    const { incrementNumber, incrementGroup } = await getFormIncrement(this.tenantDatabase, currentDate);
    const randNum = await generateFormNumber(currentDate, incrementNumber);

    await this.tenantDatabase.sequelize.transaction(async (transaction) => {
      const promisedAll = [];
      const purchaseReturn = await this.tenantDatabase.PurchaseReturn.create(
        {
          purchaseInvoiceId,
          supplierId,
          supplierName,
          tax,
        },
        { transaction }
      );

      await this.tenantDatabase.Form.create(
        {
          date: formatDate(currentDate),
          branchId: this.maker.branchId,
          number: randNum,
          done: 0,
          approvalStatus: 0,
          created_at: currentDate,
          notes,
          createdBy: this.maker.id,
          updatedBy: this.maker.id,
          incrementNumber,
          incrementGroup,
          formableId: purchaseReturn.id,
          formableType: 'PurchaseReturn',
          requestApprovalTo: approver,
        },
        { transaction }
      );

      items.forEach((val) => {
        promisedAll.push(
          this.tenantDatabase.PurchaseReturnItems.create(
            {
              purchaseReturnId: purchaseReturn.id,
              itemId: val.id,
              itemName: val.item,
              quantity: val.qtyReturn,
              price: val.price,
              discountValue: val.disc,
              unit: val.unitConverterReturn,
              notes: val.notes,
              converter: 0,
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

async function generateFormNumber(currentDate, incrementNumber) {
  const monthValue = getMonthFormattedString(currentDate);
  const yearValue = getYearFormattedString(currentDate);
  const orderNumber = `000${incrementNumber}`.slice(-3);
  return `PR${yearValue}${monthValue}${orderNumber}`;
}

function getYearFormattedString(currentDate) {
  const fullYear = currentDate.getFullYear().toString();
  return fullYear.slice(-2);
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

async function validate(tenantDatabase, maker, createPurchaseReturnDto) {
  const { purchaseInvoiceId, items, subTotal, taxbase, tax } = createPurchaseReturnDto;

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

  const isDefault = await tenantDatabase.BranchUser.findOne({
    where: { user_id: maker.id, branch_id: maker.branchId },
  });

  if (!isDefault) {
    throw new ApiError(httpStatus.NOT_FOUND, `user doesnt have branch`);
  }

  if (!isDefault.is_default) {
    throw new ApiError(httpStatus.UNPROCESSABLE_ENTITY, 'please set default branch to create this form');
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
}

module.exports = CreatePurchaseReturns;
