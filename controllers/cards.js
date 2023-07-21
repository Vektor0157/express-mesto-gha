const Card = require('../models/card');

const ERROR_CODE_BAD_REQUEST = 400;

const ERROR_CODE_NOT_FOUND = 404;

const ERROR_CODE_DEFAULT = 500;

// Обработчик для GET /cards
const getCards = (req, res) => {
  Card.find({})
    .then((cards) => {
      res.send(cards);
    })
    .catch((err) => {
      res.status(ERROR_CODE_DEFAULT).send({ message: err.message });
    });
};

// Обработчик для POST /cards
const createCard = (req, res) => {
  const { name, link } = req.body;
  const owner = req.user._id;

  Card.create({ name, link, owner })
    .then((card) => {
      res.send(card);
    })
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Переданы некорректные данные' });
      }
      res.status(ERROR_CODE_DEFAULT).send({ message: 'Что-то пошло не так' });
    });
};

// Обработчик для DELETE /cards/:cardId
const deleteCard = (req, res) => {
  const { cardId } = req.params;

  Card.findByIdAndRemove(cardId)
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (!card) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Card not found' });
      }
      res.send(card);
    })
    .catch((err) => {
      res.status(ERROR_CODE_DEFAULT).send({ message: err.message });
    });
};

// Обработчик для PUT /cards/:cardId/likes
const likeCard = (req, res) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  Card.findByIdAndUpdate(
    cardId,
    { $addToSet: { likes: userId } },
    { new: true },
  )
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (!card) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Card not found' });
      }
      res.send(card);
    })
    .catch((err) => {
      res.status(ERROR_CODE_DEFAULT).send({ message: err.message });
    });
};

// Обработчик для DELETE /cards/:cardId/likes
const dislikeCard = (req, res) => {
  const { cardId } = req.params;
  const userId = req.user._id;

  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: userId } },
    { new: true },
  )
    // eslint-disable-next-line consistent-return
    .then((card) => {
      if (!card) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Card not found' });
      }
      res.send(card);
    })
    .catch((err) => {
      res.status(ERROR_CODE_DEFAULT).send({ message: err.message });
    });
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
