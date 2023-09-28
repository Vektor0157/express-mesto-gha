const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');
const ServerError = require('../errors/ServerError');

// Контроллер для создания пользователя
const createUser = (req, res, next) => {
  const {
    email,
    password,
    name,
    about,
    avatar,
  } = req.body;
  try {
    bcrypt.hash(password, 10)
      .then((hashedPassword) => User.create({
        email,
        password: hashedPassword,
        name,
        about,
        avatar,
      }))
      .then((user) => {
        res.status(201).send({
          _id: user._id,
          email: user.email,
          name: user.name,
          about: user.about,
          avatar: user.avatar,
        });
      })
      .catch((err) => {
        if (err.code === 11000) {
          next(new ConflictError('User with this email already exists'));
        } else if (err.name === 'ValidationError') {
          next(new BadRequestError('Invalid user data'));
        } else {
          next(new ServerError(err.message || 'Something went wrong'));
        }
      });
  } catch (err) {
    next(new ServerError(err.message || 'Something went wrong'));
  }
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

// Контроллер для получения всех пользователей
const getUsers = (req, res, next) => {
  User.find()
    .then((users) => {
      res.send(users);
    })
    .catch((error) => {
      if (error.name === 'ValidationError' || error.name === 'ServerError') {
        res.status(401).send({ message: error.message });
      } else {
        next(error);
      }
    });
};

// Контроллер для получения пользователя по _id
const getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId)
    .then((user) => {
      if (!user) {
        return res.status(NotFoundError).send({ message: 'User not found' });
      }
      return res.send(user);
    })
    .catch(next);
};

const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { name, about }, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(NotFoundError).send({ message: 'User not found' });
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(res.status(BadRequestError).send({ message: 'Запрашиваемый пользователь не найден' }));
      } else {
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

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return res.status(NotFoundError).send({ message: 'User not found' });
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(res.status(BadRequestError).send({ message: 'Invalid avatar URL' }));
      }
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
