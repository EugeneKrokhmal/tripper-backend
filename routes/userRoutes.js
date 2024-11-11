const express = require('express');
const {
  getAllUsers,
  uploadPhoto,
  getProfile,
  updateUserDetails,
  updateUserPassword,
  deleteUser,
} = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/users', authMiddleware, getAllUsers);
router.get('/user/profile', authMiddleware, getProfile);
router.post('/user/upload-photo', authMiddleware, uploadPhoto);
router.put('/user/update', authMiddleware, updateUserDetails);
router.put('/user/update-password', authMiddleware, updateUserPassword);
router.delete('/user/delete', authMiddleware, deleteUser);

module.exports = router;
