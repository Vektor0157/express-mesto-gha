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
const getUserById = (req, res) => {
  const { userId } = req.params;

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
  const { name, about, avatar } = req.body;

  User.create({ name, about, avatar })
    .then((user) => {
      res.send(user);
    })
    .catch((err) => {
      res.status(ERROR_CODE_BAD_REQUEST).send({ message: err.message || 'Error while creating user' });
    });
};

const updateProfile = (req, res) => {
  const { name, about } = req.body;
  const userId = req.user._id;
  // eslint-disable-next-line max-len
  if (!name || name.length < 2 || name.length > 30 || !about || about.length < 2 || about.length > 30) {
    return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Invalid data provided' });
  }

  User.findByIdAndUpdate(userId, { name, about }, { new: true })
    .then((user) => {
      if (!user) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'User not found' });
      }
      res.send(user);
    })
    .catch((err) => {
      if (err.name === 'SomeErrorName') {
        return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Запрашиваемый пользователь не найден' });
      }
      res.status(ERROR_CODE_DEFAULT).send({ message: 'Что-то пошло не так' });
    });
};

// eslint-disable-next-line consistent-return
const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  const userId = req.user._id;
  // Validate the input data before updating the user
  if (!avatar || avatar.length === 0) {
    return res.status(ERROR_CODE_BAD_REQUEST).send({ message: 'Invalid data provided' });
  }
  User.findByIdAndUpdate(userId, { avatar }, { new: true })
    // eslint-disable-next-line consistent-return
    .then((user) => {
      if (!user) {
        return res.status(ERROR_CODE_NOT_FOUND).send({ message: 'User not found' });
      }
      res.send(user);
    })
    .catch((err) => {
      res.status(ERROR_CODE_DEFAULT).send({ message: err.message });
    });
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
};
