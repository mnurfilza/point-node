const express = require('express');
const { celebrate } = require('celebrate');
const auth = require('@src/modules/auth/services/auth.service');
const requestValidations = require('./requestValidations');
const controller = require('./controller');

const router = express.Router();

// CREATE PURCHASE RETURN
router
  .route('/')
  .post(
    celebrate(requestValidations.requireAuth),
    celebrate(requestValidations.createPurchaseReturn),
    auth(),
    controller.createPurchaseReturn
  );

// GET PURCHASE RETURN
router.route('/:purchaseReturnId').get(controller.findPurchaseReturns);
module.exports = router;
