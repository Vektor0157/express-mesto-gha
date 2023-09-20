// eslint-disable-next-line no-unused-vars
const ServerError = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'На сервере произошла ошибка.' : err.message;
  if (statusCode === 500) {
    res.status(statusCode).send({ message });
  } else {
    res.status(statusCode).send({ message }).end(); // Уберите вызов next() здесь
  }
};

module.exports = ServerError;
