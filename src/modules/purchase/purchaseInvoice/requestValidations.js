const { Joi } = require('celebrate');

const requireAuth = {
  headers: Joi.object({
    authorization: Joi.string().required(),
  }).unknown(true),
};

module.exports = {
  requireAuth,
};
