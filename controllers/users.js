const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotFoundError = require('../errors/NotFoundError');
const BadRequestError = require('../errors/BadRequestError');
const ConflictError = require('../errors/ConflictError');

const createUser = (req, res, next) => {
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
        next(err);
      }
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, 'super-strong-secret', {
        expiresIn: '7d',
      });
      res.send({ message: 'Авторизация прошла успешно', token });
    })
    .catch(next);
};

const getUsers = (req, res, next) => {
  User.find().select('-password')
    .then((users) => {
      res.status(200).send(users);
    })
    .catch(next);
};

const getUserById = (req, res, next) => {
  const { userId } = req.params;
  User.findById(userId).select('-password')
    .then((user) => {
      if (!user) {
        throw new NotFoundError('User not found');
      }
      return res.status(200).send(user);
    })
    .catch(next);
};

// eslint-disable-next-line consistent-return
const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  if (name.length < 2 || name.length > 30) {
    return next(new BadRequestError('Имя должно содержать от 2 до 30 символов'));
  }
  User.findByIdAndUpdate(userId, { name, about }, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(NotFoundError).send({ message: 'User not found' });
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Invalid user data'));
      } else {
        next(err);
      }
    });
};

const getCurrentUser = (req, res, next) => {
  const userId = req.user._id;
  User.findById(userId).select('-password')
    .then((user) => {
      if (!user) {
        return res.status(NotFoundError).send({ message: 'Пользователь не найден' });
      }
      return res.status(200).send(user);
    })
    .catch(next);
};

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  const userId = req.user._id;
  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    .then((user) => {
      if (!user) {
        return next(new NotFoundError('User not found'));
      }
      return res.send(user);
    })
    .catch((err) => {
      if (err.name === 'ValidationError') {
        next(new BadRequestError('Invalid avatar URL'));
      } else {
        next(err);
      }
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
