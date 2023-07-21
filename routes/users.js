// eslint-disable-next-line import/no-extraneous-dependencies
const express = require('express');

const {
  getUsers,
  getUserById,
  createUser,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');

const router = express.Router();

router.get('/', getUsers);
router.get('/:userId', getUserById);
router.post('/', createUser);
router.patch('/me', updateProfile);
router.patch('/avatar', updateAvatar);

module.exports = router;
