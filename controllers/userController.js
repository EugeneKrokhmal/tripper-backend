const User = require('../models/User');
const sharp = require('sharp');
const fs = require('fs');
const multer = require('multer');

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
