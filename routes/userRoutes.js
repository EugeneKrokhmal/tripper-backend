const express = require('express');
const { getAllUsers, uploadPhoto } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Get all users (only accessible when authenticated)
router.get('/users', authMiddleware, getAllUsers);
router.post('/user/upload-photo', authMiddleware, uploadPhoto);

module.exports = router;
