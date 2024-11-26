const axios = require('axios');
const Trip = require('../../models/Trip');

exports.createTrip = async (req, res) => {
    const { name, description, currency, destination, startDate, endDate } = req.body; // Add startDate and endDate to the request body
    const userId = req.user._id;

    try {
        // Fetch coordinates using OpenCage API
        const openCageUrl = `https://api.opencagedata.com/geocode/v1/json?q=${encodeURIComponent(destination)}&key=${process.env.OPENCAGE_API_KEY}`;
        const locationResponse = await axios.get(openCageUrl);

        if (locationResponse.data.results.length === 0) {
            return res.status(404).json({ message: 'Location not found' });
        }

        const locationData = locationResponse.data.results[0].geometry;

        // Create the new trip with location, start date, and end date
        const trip = new Trip({
            name,
            description,
            currency,
            creator: userId,
            participants: [userId],
            administrators: [userId],
            location: {
                destination,
                coordinates: {
                    lat: locationData.lat,
                    lng: locationData.lng,
                },
            },
            startDate,
            endDate,
        });

        await trip.save();
        res.status(201).json(trip);
    } catch (err) {
        res.status(500).json({ message: 'Error creating trip', error: err.message });
    }
};

// Get all trips with participants and creator details
exports.getTrips = async (req, res) => {
    try {
        const trips = await Trip.find()
            .populate('creator', 'name email')
            .populate('participants', 'name email profilePhoto')

        res.status(200).json(trips);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching trips', error: err.message });
    }
};

// Get trips created by the logged-in user
exports.getMyTrips = async (req, res) => {
    try {
        const trips = await Trip.find({ creator: req.user._id })
            .populate('creator', 'name email')
            .populate('participants', 'name email profilePhoto')

        res.status(200).json(trips);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching trips', error: err.message });
    }
};

// Get trips where the logged-in user is a participant or the creator
exports.getUserTrips = async (req, res) => {
    try {
        const trips = await Trip.find({
            $or: [{ creator: req.user._id }, { participants: req.user._id }],
        })
            .populate('creator', 'name email')
            .populate('participants', 'name email profilePhoto')

        res.status(200).json(trips);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching trips', error: err.message });
    }
};

exports.getTripById = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId)
            .populate('creator', 'name email')
            .populate('participants', 'name email profilePhoto')

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const { token } = req.params;

        // Check if the user is authenticated via JWT
        if (req.user) {
            const isParticipant = trip.participants.some(p => p._id.equals(req.user._id));
            const isCreator = trip.creator._id.equals(req.user._id);

            // If user is not a participant or creator, return forbidden
            if (!isParticipant && !isCreator) {
                return res.status(403).json({ message: 'You do not have permission to view this trip' });
            }
        }
        // If the user is not authenticated, check the join token
        else if (token) {
            if (token !== trip.joinToken) {
                return res.status(403).json({ message: 'Invalid join token'});
            }
        }
        // If neither authenticated nor token present, deny access
        else {
            return res.status(403).json({ message: 'No access rights' });
        }

        // Return the trip details if permission checks pass
        res.json(trip);

    } catch (err) {
        res.status(500).json({ message: 'Error fetching trip details', error: err.message });
    }
};

// Update trip (only owner can update)
exports.updateTrip = async (req, res) => {
    const { name, location, participants, startDate, endDate, description } = req.body;

    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Check if the logged-in user is the owner
        if (!trip.creator.equals(req.user._id)) {
            return res.status(403).json({ message: 'You are not authorized to edit this trip' });
        }

        trip.name = name || trip.name;
        trip.location = location || trip.location;
        trip.participants = participants || trip.participants;
        trip.startDate = startDate || trip.startDate;
        trip.endDate = endDate || trip.endDate;
        trip.description = description || trip.description;

        await trip.save();

        res.status(200).json({ message: 'Trip updated successfully', trip });
    } catch (err) {
        res.status(500).json({ message: 'Error updating trip', error: err.message });
    }
};

// Delete Trip (only owner can delete)
exports.deleteTrip = async (req, res) => {
    const { tripId } = req.params;
    const userId = req.user._id; // Assuming authMiddleware sets req.user._id

    try {
        const trip = await Trip.findById(tripId);

        if (!trip) return res.status(404).json({ message: 'Trip not found' });

        // Check if the logged-in user is the owner
        if (!trip.creator.equals(userId)) {
            return res.status(403).json({ message: 'You are not authorized to delete this trip' });
        }

        // Use findByIdAndDelete to remove the trip
        await Trip.findByIdAndDelete(tripId);

        res.status(200).json({ message: 'Trip deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: 'Error deleting trip', error: err.message });
    }
};
