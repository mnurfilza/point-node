const express = require('express');
const { celebrate } = require('celebrate');
const auth = require('@src/modules/auth/services/auth.service');
const requestValidations = require('./requestValidations');
const controller = require('./controller');

const router = express.Router();

// GET ALL ITEMS
router
  .route('/')
  .get(
    celebrate(requestValidations.requireAuth),
    auth('read purchase invoice'),
    controller.findAll
  );

module.exports = router;
