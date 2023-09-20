// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');

const errorHandler = (res) => {
  res
    .status(401)
    .send({ message: 'Необходима авторизация' });
};
// eslint-disable-next-line consistent-return
module.exports.auth = (req, res, next) => {
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
  if (!token) {
    return errorHandler(res);
  }
  let payload;
  try {
    payload = jwt.verify(token, 'your-secret-key');
  } catch (err) {
    return errorHandler(res);
  }
  req.user = payload;
  next();
};
