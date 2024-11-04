const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { sendRegistrationEmail } = require('../emailService');

// Register User
exports.register = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        // Hash the password before saving it
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user instance
        const user = new User({ name, email, password: hashedPassword });
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
        if (!user) return res.status(404).json({ message: 'User not found' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate JWT token with userId
        const token = jwt.sign({ userId: user._id, userName: user.name }, process.env.JWT_SECRET, { expiresIn: '12h' });

        // Send back token and userId
        res.status(200).json({ token, userId: user._id, userName: user.name });
    } catch (err) {
        res.status(500).json({ message: 'Server error', error: err });
    }
};