const Card = require('../models/card');
const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ForbiddenError = require('../errors/ForbiddenError');

// Обработчик для GET /cards
const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => {
      if (cards.length === 0) {
        throw new NotFoundError('No cards found');
      }
      res.send({ cards });
    })
    .catch(next);
};

// Обработчик для POST /cards
const createCard = (req, res, next) => {
  const { name, link } = req.body;
  const owner = req.user._id;
  Card.create({ name, link, owner })
    .then((card) => res.status(201).send({ card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Переданы некорректные данные при создании карты.'));
      } else {
        next(err);
      }
    });
};
// Обработчик для DELETE /cards/:cardId
const deleteCard = (req, res, next) => {
  Card.findById(req.params.cardId)
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка по указанному _id не найдена.');
      }
      if (!card.owner.equals(req.user._id)) {
        throw new ForbiddenError('Невозможно удалить чужую карточку.');
      }
      card.deleteOne()
        .then(() => {
          res.status(200).send({ message: 'Карточка успешно удалена' });
        })
        .catch(next);
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
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена');
      }
      res.send({ data: card });
    })
    .catch(next);
};

// Обработчик для DELETE /cards/:cardId/likes
const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (!card) {
        throw new NotFoundError('Карточка с указанным _id не найдена');
      }
      res.send({ data: card });
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
