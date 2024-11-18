const Trip = require('../../models/Trip');
const calculateSettlements = require('../../helpers/settlementHelper');

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
