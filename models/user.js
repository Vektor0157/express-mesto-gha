// eslint-disable-next-line import/no-extraneous-dependencies
const mongoose = require('mongoose');
// eslint-disable-next-line import/no-unresolved, import/no-extraneous-dependencies
const validator = require('validator');
const ValidationError = require('../errors/ValidationError');

// eslint-disable-next-line function-paren-newline
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    default: 'Жак-Ив Кусто',
  },
  about: {
    type: String,
    required: true,
    minlength: 2,
    maxlength: 30,
    default: 'Исследователь',
  },
  avatar: {
    type: String,
    required: true,
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
        throw new ValidationError('Неправильные почта или пароль');
      }
      // eslint-disable-next-line no-undef
      return bcrypt.compare(password, user.password)
        .then((match) => {
          if (!match) {
            throw new ValidationError('Неправильные почта или пароль');
          }
          return user;
        });
    });
};
module.exports = mongoose.model('User', userSchema);
