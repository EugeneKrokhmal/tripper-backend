const Trip = require('../../models/Trip');

// Add an administrator to the trip
exports.addAdministrator = async (req, res) => {
    const { userId } = req.body;
    const { tripId } = req.params;

    try {
        const trip = await Trip.findById(tripId);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Check if the requester is the creator or an admin
        if (!trip.isAdminOrCreator(req.user._id)) {
            return res.status(403).json({ message: 'Unauthorized: Only the creator or administrators can add an admin.' });
        }

        // Ensure the user being added as an admin is already a participant
        if (!trip.participants.includes(userId)) {
            return res.status(400).json({ message: 'User must be a participant to be added as an administrator' });
        }

        // Check if the user is already an admin
        if (trip.administrators.includes(userId)) {
            return res.status(400).json({ message: 'User is already an administrator' });
        }

        // Add the user to administrators
        trip.administrators.push(userId);
        await trip.save();

        res.status(200).json({ message: 'Administrator added successfully', administrators: trip.administrators });
    } catch (error) {
        res.status(500).json({ message: 'Error adding administrator', error: error.message });
    }
};

// Remove an administrator from the trip
exports.removeAdministrator = async (req, res) => {
    const { userId } = req.body;
    const { tripId } = req.params;

    try {
        const trip = await Trip.findById(tripId);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Check if the requester is the creator or an admin
        if (!trip.isAdminOrCreator(req.user._id)) {
            return res.status(403).json({ message: 'Unauthorized: Only the creator or administrators can remove an admin.' });
        }

        // Prevent removing the creator from admins
        if (trip.creator.equals(userId)) {
            return res.status(400).json({ message: 'Cannot remove the creator from administrators' });
        }

        // Check if the user is actually an admin
        if (!trip.administrators.includes(userId)) {
            return res.status(400).json({ message: 'User is not an administrator' });
        }

        // Remove the user from administrators
        trip.administrators = trip.administrators.filter(adminId => !adminId.equals(userId));
        await trip.save();

        res.status(200).json({ message: 'Administrator removed successfully', administrators: trip.administrators });
    } catch (error) {
        res.status(500).json({ message: 'Error removing administrator', error: error.message });
    }
};
