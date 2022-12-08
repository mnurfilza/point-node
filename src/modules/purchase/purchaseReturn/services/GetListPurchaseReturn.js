const { Op } = require('sequelize');

class GetListPurchaseReturn {
  constructor(tenantDatabase, queries = {}) {
    this.tenantDatabase = tenantDatabase;
    this.queries = queries;
  }

  async call() {
    // show list purchase return
    const [queryLimit, queryPage] = [parseInt(this.queries.limit, 10) || 10, parseInt(this.queries.page, 10) || 1];

    const { count: total, rows: data } = await this.tenantDatabase.PurchaseReturn.findAndCountAll({
      order: [['id', 'ASC']],
      include: [{ model: this.tenantDatabase.Form, as: 'form', where: getQueryParams(this.queries) }],
      limit: queryLimit,
      offset: offsetParams(queryPage, queryLimit),
    });
    const totalPage = Math.ceil(total / parseInt(queryLimit, 10));

    return { data, maxItem: queryLimit, currentPage: queryPage, totalPage, total };
  }
}

function getQueryParams(queries) {
  const filter = { [Op.and]: [] };

  // form done status
  const filterDoneForm = { done: queries.filter_form };
  filter[Op.and] = [...filter[Op.and], filterDoneForm];

  // form  status Approval
  const statusApproval = { approval_status: queries.filter_approval };
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
