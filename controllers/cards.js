const Card = require('../models/card');

const ObjectId = mongoose.Types.ObjectId;

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

  if (!name || !link) {
    return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Name and link are required' });
  }

  Card.create({ name, link, owner })
    .then((card) => {
      res.send(card);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Invalid data provided' });
      }
      res.status(ERROR_CODE_DEFAULT).send({ message: 'Something went wrong' });
    });
};

// Обработчик для DELETE /cards/:cardId
const deleteCard = (req, res) => {
  const { cardId } = req.params;

  if (!ObjectId.isValid(cardId)) {
    return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Invalid card ID' });
  }

  Card.findByIdAndRemove(cardId)
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
