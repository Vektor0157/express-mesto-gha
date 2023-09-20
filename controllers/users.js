// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
const bcrypt = require('bcrypt');
// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
// eslint-disable-next-line import/no-extraneous-dependencies
const { celebrate, Joi } = require('celebrate');
const User = require('../models/user');

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');
const ServerError = require('../errors/ServerError');
// Контроллер для получения всех пользователей
const getUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      res.send(users);
    })
    .catch(() => {
      next(new ServerError('На сервере произошла ошибка.'));
    });
};

// Контроллер для получения пользователя по _id
// eslint-disable-next-line consistent-return
const getUserById = (req, res) => {
  const { userId } = req.params;
  User.findById(userId)
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        return res.status(NotFoundError).send({ message: 'User not found' });
      }
      res.send(user);
    })
    // eslint-disable-next-line no-undef
    .catch(next);
};

// Контроллер для создания пользователя
const createUser = (req, res) => {
  const {
    email,
    password,
    name,
    about,
    avatar,
  } = req.body;
  bcrypt.hash(password, 10)
    .then((hashedPassword) => User.create({
      email,
      password: hashedPassword,
      name,
      about,
      avatar,
    }))
    .then((user) => {
      res.send({
        _id: user._id,
        email: user.email,
        name: user.name,
        about: user.about,
        avatar: user.avatar,
      });
    })
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.code === 11000) {
        // eslint-disable-next-line no-undef
        next(new ConflictError('User with this email already exists'));
      } else if (err.name === 'ValidationError') {
        // eslint-disable-next-line no-undef
        next(new BadRequestError('Invalid user data'));
      }
      // eslint-disable-next-line no-undef
      next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  return User.findOne(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'super-strong-secret', {
        expiresIn: '7d',
      });
      res.send({ message: 'Авторизация прошла успешно', token });
    })
    .catch(next);
};
// eslint-disable-next-line consistent-return
const updateProfile = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  // eslint-disable-next-line max-len
  if (!name || name.length < 2 || name.length > 30 || !about || about.length < 2 || about.length > 30) {
    return res.status(BadRequestError).send({ message: 'Invalid data provided' });
  }
  User.findByIdAndUpdate(userId, { name, about }, { new: true })
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        return res.status(NotFoundError).send({ message: 'User not found' });
      }
      res.send(user);
    })
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // eslint-disable-next-line no-undef
        next(res.status(NotFoundError).send({ message: 'Запрашиваемый пользователь не найден' }));
      } else {
        // eslint-disable-next-line no-undef
        next(err);
      }
    });
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user)
    .then((user) => {
      res.send({ user });
    })
    .catch(next);
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  // Validate avatar here if necessary (e.g., check if it's a valid URL)

  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        return res.status(NotFoundError).send({ message: 'User not found' });
      }
      res.send(user);
    })
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'ValidationError') {
        // eslint-disable-next-line no-undef
        next(res.status(BadRequestError).send({ message: 'Invalid avatar URL' }));
      }
      // eslint-disable-next-line no-undef
      next(new ServerError(err.message || 'Something went wrong'));
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
  login,
  getCurrentUser,
};
