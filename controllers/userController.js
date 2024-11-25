const User = require('../models/User');
const Trip = require('../models/Trip');
const sharp = require('sharp');
const fs = require('fs');
const multer = require('multer');
const { sendEmailChangeNotification } = require('../emailService');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`);
    },
});

const upload = multer({ storage });

exports.uploadPhoto = [
    upload.single('profilePhoto'),
    async (req, res) => {
        try {
            const userId = req.user.id;
            const user = await User.findById(userId);

            if (!user) {
                return res.status(404).send('User not found');
            }

            const filePath = `uploads/compressed-${Date.now()}-${req.file.originalname}`;
            await sharp(req.file.path)
                .rotate()
                .resize(500)
                .jpeg({ quality: 70 })
                .toFile(filePath);

            // Remove the original file after compression
            fs.unlinkSync(req.file.path);

            // Update user profile photo path
            user.profilePhoto = filePath;
            await user.save();

            res.status(200).json({ imageUrl: filePath });
        } catch (error) {
            console.error(error);
            res.status(500).send('Server error');
        }
    },
];

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password').select('name email profilePhoto');; // Exclude passwords
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching users', error: err });
    }
};

exports.getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.updateUserDetails = async (req, res) => {
    const { userName, userEmail } = req.body;

    try {
        // Find the user by ID
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Store the old email before updating
        const oldEmail = user.email;

        // Update the user details
        user.name = userName || user.name;
        user.email = userEmail || user.email;

        // Save the updated user
        await user.save();

        // Check if the email has changed
        if (userEmail && userEmail !== oldEmail) {
            // Send an email notification to the old email address
            await sendEmailChangeNotification(oldEmail, userEmail, user.name);
        }

        res.status(200).json({
            userName: user.name,
            email: user.email,
        });

        console.log(user, userEmail !== oldEmail);

    } catch (error) {
        console.error('Error updating user details:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Update user password
exports.updateUserPassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    try {
        const user = await User.findById(req.user.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if current password matches
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Current password is incorrect' });
        }

        // Hash the new password before saving
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

exports.deleteUser = async (req, res) => {
    const { tripId, userId } = req.body;

    if (!tripId || !userId) {
        return res.status(400).json({ message: 'tripId and userId are required' });
    }

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const isParticipant = trip.participants.includes(userId);
        if (!isParticipant) {
            return res.status(404).json({ message: 'User is not a participant in this trip' });
        }

        trip.participants = trip.participants.filter(
            (participant) => participant.toString() !== userId
        );

        await trip.save();

        res.status(200).json({
            message: 'User removed from the trip successfully',
            participants: trip.participants,
        });
    } catch (error) {
        console.error('Error removing user from trip:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
