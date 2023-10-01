// eslint-disable-next-line import/no-extraneous-dependencies
const express = require('express');

const router = express.Router();
const { celebrate, Joi } = require('celebrate');
const auth = require('../middlewares/auth');
const {
  getUsers,
  getUserById,
  updateProfile,
  updateAvatar,
  getCurrentUser,
} = require('../controllers/users');

router.get('/', auth, getUsers);
router.get('/me', auth, getCurrentUser);

router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().length(24).hex().required(),
  }),
}), getUserById);

router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    about: Joi.string().required().min(2).max(30),
  }),
}), auth, updateProfile);

router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().regex(/^(https?:\/\/)?([a-z0-9-]+\.)*[a-z0-9-]+\.[a-z]{2,}\/?([^\s]*)$/),
  }),
}), auth, updateAvatar);

module.exports = router;
