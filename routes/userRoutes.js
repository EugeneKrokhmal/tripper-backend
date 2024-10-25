const express = require('express');
const { getAllUsers } = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Get all users (only accessible when authenticated)
router.get('/users', authMiddleware, getAllUsers);

module.exports = router;
