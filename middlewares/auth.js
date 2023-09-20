// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');

const ValidationError = require('../errors/ValidationError');
// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return ValidationError(res);
  }
  let payload;
  try {
    payload = jwt.verify(token, 'your-secret-key');
  } catch (err) {
    return ValidationError(res);
  }
  req.user = payload;
  next();
};
