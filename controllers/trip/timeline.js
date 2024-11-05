const Trip = require('../../models/Trip');

// Controller to fetch the trip timeline
exports.getTripTimeline = async (req, res) => {
    const { tripId } = req.params;

    try {
        const trip = await Trip.findById(tripId).populate('participants');
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Check if the user is authorized to view the trip
        const isParticipant = trip.participants.some(p => p._id.equals(req.user._id));
        const isCreator = trip.creator._id.equals(req.user._id);
        if (!isParticipant && !isCreator) {
            return res.status(403).json({ message: 'You do not have permission to view this trip' });
        }

        // Return the trip timeline with the activities (name and description)
        res.status(200).json({ timeline: trip.timeline });
    } catch (error) {
        res.status(500).json({ message: 'Error fetching timeline', error: error.message });
    }
};

// Controller to update the trip timeline
exports.updateTripTimeline = async (req, res) => {
    const { tripId } = req.params;
    const { timeline } = req.body;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Ensure the timeline follows the expected structure
        if (typeof timeline !== 'object') {
            return res.status(400).json({ message: 'Invalid timeline format' });
        }

        // Check for overlapping times for each date
        for (const date in timeline) {
            const activities = timeline[date];
            const times = activities.map(activity => activity.time);
            const uniqueTimes = new Set(times);

            if (uniqueTimes.size !== times.length) {
                return res.status(400).json({ message: `Overlapping activity times on ${date}` });
            }

            // Sort activities by time for the date
            timeline[date].sort((a, b) => a.time.localeCompare(b.time));
        }

        // Update the trip's timeline
        trip.timeline = timeline;  // Set the timeline to the new value
        await trip.save();

        res.status(200).json({ message: 'Timeline updated successfully', timeline: trip.timeline });
    } catch (error) {
        res.status(500).json({ message: 'Error updating timeline', error: error.message });
    }
};
