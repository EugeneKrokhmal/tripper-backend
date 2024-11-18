const express = require('express');
const { register, login, resetPassword, requestPasswordReset } = require('../controllers/authController');
const router = express.Router();

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Route for requesting a password reset
router.post('/request-password-reset', requestPasswordReset);

// Route for resetting the password
router.post('/reset-password', resetPassword);

module.exports = router;
