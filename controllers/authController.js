const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendRegistrationEmail, sendPasswordResetEmail } = require('../emailService');

// Register User
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const user = new User({ name, email, password });
        await user.save();

        // Send a registration email
        await sendRegistrationEmail(email, name, password);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(400).json({ message: 'Error registering user', error: err });
    }
};

// Login User
exports.login = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (!user) {
            console.log('User not found for email:', email);
            return res.status(404).json({ message: 'User not found' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign({ userId: user._id, userName: user.name }, process.env.JWT_SECRET, { expiresIn: '12h' });

        res.status(200).json({ token, userId: user._id, userName: user.name, profilePhoto: user.profilePhoto });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};

exports.requestPasswordReset = async (req, res) => {
    const { email } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: 'User with this email does not exist' });
        }

        // Generate a password reset token
        const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send reset email with the token
        await sendPasswordResetEmail(email, resetToken, user.name);

        res.status(200).json({ message: 'Password reset email sent successfully' });
    } catch (err) {
        console.error('Error in requestPasswordReset:', err);
        res.status(500).json({ message: 'Server error', error: err.message });
    }
};

// Reset Password
exports.resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    // Password validation
    const passwordRegex = /^(?=.*[A-Z])(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,}$/;
    if (!passwordRegex.test(newPassword)) {
        return res.status(400).json({ message: 'Password must be at least 8 characters long, contain at least one capital letter, and at least one symbol' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Set the new password directly
        user.password = newPassword;

        // Save the updated user, the pre-save hook will hash the password
        await user.save();

        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        if (err.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Reset token expired, please request a new one' });
        } else if (err.name === 'JsonWebTokenError') {
            return res.status(400).json({ message: 'Invalid reset token' });
        } else {
            res.status(500).json({ message: 'Server error', error: err });
        }
    }
};
