class UpdatePurchaseReturn {
  constructor(tenantDatabase, { maker, updatePurchaseReturn }) {
    this.tenantDatabase = tenantDatabase;
    this.maker = maker;
    this.updatePurchaseReturn = updatePurchaseReturn;
  }

  // eslint-disable-next-line no-empty-function
  async call() {}
}

module.exports = UpdatePurchaseReturn;
