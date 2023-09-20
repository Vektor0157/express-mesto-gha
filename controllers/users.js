const { isValidObjectId } = require('mongoose');
// eslint-disable-next-line import/no-unresolved
const bcrypt = require('bcrypt');
// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const ERROR_CODE_BAD_REQUEST = 400;

const ERROR_CODE_NOT_FOUND = 404;

const ERROR_CODE_DEFAULT = 500;

// Контроллер для получения всех пользователей
const getUsers = (req, res) => {
  User.find()
    .then((users) => {
      res.send(users);
    })
    .catch((err) => {
      res.status(ERROR_CODE_DEFAULT).send({ message: err.message || 'Error while getting users' });
    });
};

// Контроллер для получения пользователя по _id
// eslint-disable-next-line consistent-return
const getUserById = (req, res) => {
  const { userId } = req.params;
  if (!isValidObjectId(userId)) {
    return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Invalid user ID' });
  }
  User.findById(userId)
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'User not found' });
      }
      res.send(user);
    })
    .catch((err) => {
      res.status(ERROR_CODE_DEFAULT).send({ message: err.message || 'Error while getting user by id' });
    });
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
      if (err.name === 'ValidationError') {
        return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Invalid user data' });
      }
      res.status(ERROR_CODE_BAD_REQUEST).send({ message: err.message || 'Error while creating user' });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;
  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        return res.status(401).send({ message: 'Неправильные почта или пароль' });
      }
      return bcrypt.compare(password, user.password)
        // eslint-disable-next-line consistent-return
        .then((match) => {
          if (!match) {
            return res.status(401).send({ message: 'Неправильные почта или пароль' });
          }
          const token = jwt.sign({ _id: user._id.toString() }, 'your-secret-key', { expiresIn: '7d' });
          res.cookie('jwt', token, { httpOnly: true });
          res.send({ message: 'Аутентификация успешна' });
        })
        .catch(() => {
          res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на сервере' });
        });
    })
    .catch(() => {
      res.status(ERROR_CODE_DEFAULT).send({ message: 'Ошибка на сервере' });
    });
};

// eslint-disable-next-line consistent-return
const updateProfile = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  // eslint-disable-next-line max-len
  if (!name || name.length < 2 || name.length > 30 || !about || about.length < 2 || about.length > 30) {
    return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Invalid data provided' });
  }
  User.findByIdAndUpdate(userId, { name, about }, { new: true })
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'User not found' });
      }
      res.send(user);
    })
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      res.status(ERROR_CODE_DEFAULT).send({ message: 'Что-то пошло не так' });
    });
};

const getCurrentUser = (req, res) => {
  const {
    _id, name,
    about,
    avatar,
  } = req.user;
  res.send({
    _id,
    name,
    about,
    avatar,
  });
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;

  // Validate avatar here if necessary (e.g., check if it's a valid URL)

  User.findByIdAndUpdate(userId, { avatar }, { new: true, runValidators: true })
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'User not found' });
      }
      res.send(user);
    })
    // eslint-disable-next-line consistent-return
    .catch((err) => {
      if (err.name === 'ValidationError') {
        return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Invalid avatar URL' });
      }
      res.status(ERROR_CODE_DEFAULT).send({ message: err.message || 'Something went wrong' });
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
