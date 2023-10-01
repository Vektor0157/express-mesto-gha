const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');

// Обработчик для GET /cards
const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      res.send({ cards });
    })
    .catch(next);
};

// Обработчик для POST /cards
const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Card not found'));
      }
      return res.status(201).send({ data: card });
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании карты.'));
      } else {
        // Handle unexpected errors with a 500 status code
        next(new Error('Internal Server Error'));
      }
    });
};
// Обработчик для DELETE /cards/:cardId
const deleteCard = (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Card not found'));
      }
      if (!card.owner.equals(userId)) {
        return next(new ForbiddenError('Невозможно удалить чужую карточку'));
      }
      return Card.findByIdAndRemove(cardId)
        .then((deletedCard) => {
          if (!deletedCard) {
            return next(new NotFoundError('Card not found')); // Handle if the card is not found during the deletion
          }
          return res.status(200).send(deletedCard);
        });
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        next(new BadRequestError('Переданы некорректные данные.'));
      } else {
        next(err);
      }
    });
};

// Обработчик для PUT /cards/:cardId/likes
const likeCard = (req, res, next) => {
  const { cardId } = req.params;
  const userId = req.user._id;
  Card.findById(cardId)
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Card not found'));
      }
      return Card.findByIdAndUpdate(
        cardId,
        { $addToSet: { likes: userId } },
        { new: true },
      )
        .then((updatedCard) => {
          if (!updatedCard) {
            return next(new NotFoundError('Card not found')); // Handle if the card is not found during the update
          }
          return res.status(200).send(updatedCard);
        })
        .catch(next);
    })
    .catch(next);
};

// Обработчик для DELETE /cards/:cardId/likes
const dislikeCard = (req, res, next) => {
  const { cardId, userId } = req.params;
  Card.findByIdAndUpdate(
    cardId,
    { $pull: { likes: userId } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        return next(new NotFoundError('Card not found'));
      }
      return res.status(200).send(card);
    })
    .catch(next);
};

module.exports = {
  getCards,
  createCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
