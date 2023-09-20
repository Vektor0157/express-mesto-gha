// eslint-disable-next-line import/no-extraneous-dependencies
const express = require('express');

const auth = require('../middlewares/auth');
const { getCurrentUser } = require('../controllers/users');

const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');

router.get('/', auth, getUsers);
router.get('/:userId', getUserById);
router.get('/me', auth, getCurrentUser);
router.post('/', createUser);
router.patch('/me', updateProfile);
router.patch('/me/avatar', updateAvatar);

module.exports = router;
