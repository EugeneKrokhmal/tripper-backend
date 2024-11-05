const sharp = require('sharp');
const fs = require('fs');
const Trip = require('../../models/Trip');

exports.uploadTripImage = async (req, res) => {
    const trip = await Trip.findById(req.params.tripId);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    const filePath = `uploads/compressed-${Date.now()}-${req.file.originalname}`;
    try {
        await sharp(req.file.path).rotate().resize(1000).jpeg({ quality: 70 }).toFile(filePath);
        fs.unlinkSync(req.file.path);
        trip.image = filePath;
        await trip.save();

        res.status(200).json({ imageUrl: filePath });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading image', error: error.message });
    }
};
