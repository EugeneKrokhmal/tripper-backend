const Trip = require('../../models/Trip');
const User = require('../../models/User');
const calculateSettlements = require('../../helpers/settlementHelper');
const { sendInviteEmail } = require('../../emailService');


exports.generateJoinLink = async (req, res) => {
    try {
        const { tripId } = req.params;
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const joinToken = trip.generateJoinToken();
        await trip.save();

        const joinLink = `${process.env.BASE_URL}/#/login?redirect=/join/${trip._id}/${joinToken}`;
        res.status(200).json({ joinLink });
    } catch (error) {
        console.error('Error generating join link:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.joinTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        if (req.params.token !== trip.joinToken) {
            return res.status(403).json({ message: 'Invalid join token' });
        }

        if (!trip.participants.includes(req.user._id)) {
            trip.participants.push(req.user._id);

            const settlements = calculateSettlements(trip.expenses, trip.participants, trip.settlements, trip.settlementHistory);
            trip.settlements = settlements;

            await trip.save();
        }

        res.json({ message: 'You have successfully joined the trip!' });
    } catch (err) {
        res.status(500).json({ message: 'Error joining trip', error: err.message });
    }
};

exports.inviteUserToTripByEmail = async (req, res) => {
    try {
        const { tripId, email, tripName, tripImage, formattedStartDate, formattedEndDate, tripDescription } = req.body;

        if (!tripId || !email) {
            return res.status(400).json({ message: 'tripId and email are required.' });
        }

        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const user = await User.findOne({ email });

        if (user && trip.participants.includes(user._id)) {
            return res.status(400).json({ message: 'User is already part of this trip.' });
        }

        // Generate the join token and send the email
        const joinToken = trip.generateJoinToken();
        await trip.save();

        const joinLink = `${process.env.BASE_URL}/#/${user ? 'login': 'register'}?redirect=/join/${tripId}/${joinToken}`;
        await sendInviteEmail(email, joinLink, tripName, tripImage, formattedStartDate, formattedEndDate, tripDescription);

        res.status(200).json({ message: 'Invitation sent successfully.' });
    } catch (error) {
        console.error('Error inviting user:', error);
        res.status(500).json({ message: 'Error inviting user', error: error.message });
    }
};

