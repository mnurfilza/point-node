const { Op } = require('sequelize');

class GetListPurchaseReturn {
  constructor(tenantDatabase, queries = {}) {
    this.tenantDatabase = tenantDatabase;
    this.queries = queries;
  }

  async call() {
    // show list purchase return
    const [queryLimit, queryPage] = [parseInt(this.queries.limit, 10) || 10, parseInt(this.queries.page, 10) || 1];
    const list = this.tenantDatabase.PurchaseReturn.findAll({
      where: getQueryParams(this.queries),
      order: ['id', 'ASC'],
      include: [
        { model: this.tenantDatabase.Form, as: 'form' },
        { model: this.tenantDatabase.PurchaseReturnItems, as: 'items' },
      ],
      limit: queryLimit,
      offset: offsetParams(queryPage, queryLimit),
    });
    return list;
  }
}

function getQueryParams(queries) {
  const filter = { [Op.and]: [] };

  // form done status
  const filterDoneForm = { done: queries.filter_form };
  filter[Op.and] = [...filter[Op.and], filterDoneForm];

  // form done status
  const statusApproval = { approvalStatus: queries.approval_status };
  filter[Op.and] = [...filter[Op.and], statusApproval];

  // like
  const filterLike = generateFilterLike(queries.filter_like);
  if (filterLike.length > 0) {
    filter[Op.and] = [...filter[Op.and], { [Op.or]: filterLike }];
  }

  return filter;
}

function offsetParams(page = 1, maxItem = 10) {
  return page > 1 ? maxItem * (page - 1) : 0;
}

function generateFilterLike(likeQueries) {
  if (!likeQueries) {
    return [];
  }

  const filtersObject = JSON.parse(likeQueries);
  const filterKeys = Object.keys(filtersObject);

  const result = filterKeys.map((key) => {
    const likeKey = key.split('.').length > 1 ? `$${key}$` : key;

    return {
      [likeKey]: { [Op.substring]: filtersObject[key] || '' },
    };
  });

  return result;
}

module.exports = GetListPurchaseReturn;
