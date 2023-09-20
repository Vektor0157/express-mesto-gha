// eslint-disable-next-line import/no-extraneous-dependencies
const express = require('express');
const { getCurrentUser } = require('../controllers/users');

const router = express.Router();

const {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/:userId', getUserById);
router.get('/me', getCurrentUser);
router.patch('/me', updateProfile);
router.patch('/me/avatar', updateAvatar);
router.post('/', createUser);

module.exports = router;
