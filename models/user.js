const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const validator = require('validator');
const ValidationError = require('../errors/ValidationError');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      minlength: 2,
      maxlength: 30,
      default: 'Жак-Ив Кусто',
    },
    about: {
      type: String,
      minlength: 2,
      maxlength: 30,
      default: 'Исследователь',
    },
    avatar: {
      type: String,
      default: 'https://pictures.s3.yandex.net/resources/jacques-cousteau_1604399756.png',
      validate: {
        validator: (value) => validator.isURL(value, {
          protocols: ['http', 'https'],
          require_tld: true,
          require_protocol: true,
        }),
        message: 'Неверный формат URL для аватара',
      },
    },
    email: {
      type: String,
      unique: true,
      required: true,
      validate: {
        validator: validator.isEmail,
        message: 'Неверный формат email',
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
      minlength: 6,
    },
  },
  {
    versionKey: false,
  },
);
// eslint-disable-next-line func-names
userSchema.statics.findUserByCredentials = function (email, password) {
  return this.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new ValidationError('Почта и пароль введены неверно');
      }
      return bcrypt.compare(password, user.password)
        .then((match) => {
          if (!match) {
            throw new ValidationError('Почта и пароль введены неверно');
          }
          return user;
        });
    });
};
module.exports = mongoose.model('User', userSchema);
