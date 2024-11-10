const Trip = require('../../models/Trip');
const User = require('../../models/User');

// Invite users to a trip
exports.inviteToTrip = async (req, res) => {
    const { tripId, userIds } = req.body;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Ensure only the creator can invite users
        if (!trip.creator.equals(req.user._id)) {
            return res.status(403).json({ message: 'You are not authorized to invite users' });
        }

        // Add the new participants if they are not already participants
        userIds.forEach((userId) => {
            if (!trip.participants.includes(userId)) {
                trip.participants.push(userId);
            }
        });

        await trip.save();
        res.status(200).json(trip);
    } catch (err) {
        res.status(500).json({ message: 'Error inviting users', error: err.message });
    }
};

// Add a participant (only the owner can add)
exports.addParticipant = async (req, res) => {
    const { email } = req.body;

    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const participant = await User.findOne({ email }).select('name email profilePhoto');
        if (!participant) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user is already a participant
        if (trip.participants.includes(participant._id)) {
            return res.status(400).json({ message: 'User is already a participant' });
        }

        trip.participants.push(participant._id);
        await trip.save();

        res.json(trip);
    } catch (err) {
        res.status(500).json({ message: 'Error adding participant', error: err.message });
    }
};

// Remove a participant (only the owner can remove)
exports.removeParticipant = async (req, res) => {
    const { userId } = req.body;

    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Ensure only the creator can remove participants
        if (!trip.creator.equals(req.user._id)) {
            return res.status(403).json({ message: 'You are not authorized to remove participants' });
        }

        // Remove the participant
        trip.participants = trip.participants.filter(p => !p.equals(userId));
        await trip.save();

        res.json(trip);
    } catch (err) {
        res.status(500).json({ message: 'Error removing participant', error: err.message });
    }
};
