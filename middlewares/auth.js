const jwt = require('jsonwebtoken');
const ValidationError = require('../errors/ValidationError');

const extractBearerToken = (header) => header.replace('Bearer ', '');

// eslint-disable-next-line consistent-return
module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    return next();
  }
  const token = extractBearerToken(authorization);
  try {
    const payload = jwt.verify(token, 'super-strong-secret');
    req.user = payload;
    next();
  } catch (err) {
    return next(new ValidationError('Неверный токен'));
  }
};
