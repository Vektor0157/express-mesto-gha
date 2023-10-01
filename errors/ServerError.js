// eslint-disable-next-line no-unused-vars
const ServerError = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'На сервере произошла ошибка.' : err.message;

  res.status(statusCode).send({ message });
};

module.exports = ServerError;
