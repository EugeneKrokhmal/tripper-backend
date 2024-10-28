const axios = require('axios');
const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const Trip = require('../models/Trip');
const User = require('../models/User');
const calculateSettlements = require('../helpers/settlementHelper');

require('dotenv').config(); // Load environment variables

exports.createTrip = async (req, res) => {
    const { name, description, destination, startDate, endDate } = req.body; // Add startDate and endDate to the request body
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
            creator: userId,
            participants: [userId],
            location: {
                destination,
                coordinates: {
                    lat: locationData.lat,
                    lng: locationData.lng,
                },
            },
            startDate,  // Store start date
            endDate,    // Store end date
        });

        await trip.save();
        res.status(201).json(trip);
    } catch (err) {
        res.status(500).json({ message: 'Error creating trip', error: err.message });
    }
};

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

// Get all trips with participants and creator details
exports.getTrips = async (req, res) => {
    try {
        const trips = await Trip.find()
            .populate('creator', 'name email')
            .populate('participants', 'name email');

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
            .populate('participants', 'name email');

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
            .populate('participants', 'name email');

        res.status(200).json(trips);
    } catch (err) {
        res.status(500).json({ message: 'Error fetching trips', error: err.message });
    }
};

exports.getTripById = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId)
            .populate('creator', 'name email')
            .populate('participants', 'name email');

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
                return res.status(403).json({ message: 'Invalid join token ' + token + '<br>' + trip.joinToken });
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

// Add a participant (only the owner can add)
exports.addParticipant = async (req, res) => {
    const { email } = req.body;

    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Ensure only the creator can add participants
        if (!trip.creator.equals(req.user._id)) {
            return res.status(403).json({ message: 'You are not authorized to add participants' });
        }

        const participant = await User.findOne({ email });
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

exports.createTripExpense = async (req, res) => {
    const { tripId } = req.params;
    const { expenseName, expenseDescription, amount, date, responsibleUserId, splitMethod, splitParticipants } = req.body;

    try {
        const trip = await Trip.findById(tripId);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Ensure that the responsible user is part of the trip participants
        const isResponsibleParticipant = trip.participants.includes(responsibleUserId);
        if (!isResponsibleParticipant) {
            return res.status(400).json({ message: 'Responsible user must be a participant of the trip' });
        }

        let finalSplitParticipants;
        if (splitMethod === 'even') {
            // If split method is 'even', include all participants
            finalSplitParticipants = trip.participants;
        } else {
            // Verify that all split participants are valid participants
            finalSplitParticipants = splitParticipants.filter(p => trip.participants.includes(p));
            if (finalSplitParticipants.length === 0) {
                return res.status(400).json({ message: 'Invalid split participants' });
            }
        }

        const newExpense = {
            expenseName,
            expenseDescription,
            amount,
            date: date || new Date(),
            responsibleUserId,
            splitMethod,
            splitParticipants: finalSplitParticipants,
        };

        // Add the new expense to the trip
        trip.expenses.push(newExpense);

        // Pass settlementHistory to calculateSettlements to handle previously settled debts
        const settlements = calculateSettlements(trip.expenses, trip.participants, trip.settlements, trip.settlementHistory);
        trip.settlements = settlements;

        await trip.save();

        res.status(201).json({ message: 'Expense added successfully', expense: newExpense });
    } catch (error) {
        console.error('Error adding expense:', error);
        res.status(500).json({ message: 'Error adding expense', error: error.message });
    }
};

exports.deleteExpense = async (req, res) => {
    const { tripId, expenseId } = req.params;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Find the expense by ID and remove it from the expenses array
        const expenseIndex = trip.expenses.findIndex(expense => expense._id.toString() === expenseId);
        if (expenseIndex === -1) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Remove the expense
        trip.expenses.splice(expenseIndex, 1);

        // Recalculate settlements with settlement history
        const settlements = calculateSettlements(trip.expenses, trip.participants, trip.settlements, trip.settlementHistory);
        trip.settlements = settlements;

        await trip.save();

        res.status(200).json({ message: 'Expense deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting expense', error: error.message });
    }
};

exports.calculateFairShare = async (req, res) => {
    try {
        const { tripId } = req.params;

        // Find the trip by ID and populate participants
        const trip = await Trip.findById(tripId).populate('participants');

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Calculate total trip cost
        const totalCost = trip.expenses.reduce((acc, expense) => acc + expense.amount, 0);

        // Calculate fair share
        const fairShare = totalCost / trip.participants.length;

        // Calculate settlements using the helper, including the settlement history
        const settlements = calculateSettlements(trip.expenses, trip.participants, trip.settlements, trip.settlementHistory);

        // Update the trip with calculated fair share and settlements
        trip.fairShare = fairShare;
        trip.settlements = settlements;

        await trip.save();

        res.status(200).json({ fairShare, settlements });
    } catch (error) {
        console.error('Error calculating fair share:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Controller to generate a join link for a trip
exports.generateJoinLink = async (req, res) => {
    try {
        const { tripId } = req.params;

        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Only the creator can generate the join link
        if (trip.creator.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Generate a unique join token
        const joinToken = trip.generateJoinToken();
        await trip.save();

        // Create the full join link
        const joinLink = `${process.env.BASE_URL}/login?redirect=/join/${trip._id}/${joinToken}`;

        res.status(200).json({ joinLink });
    } catch (error) {
        console.error('Error generating join link:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

// Endpoint for joining a trip by token
exports.joinTrip = async (req, res) => {
    try {
        const trip = await Trip.findById(req.params.tripId);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Verify that the provided token matches the one stored in the trip
        if (req.params.token !== trip.joinToken) {
            return res.status(403).json({ message: 'Invalid join token ' + trip.joinToken });
        }

        // Add the user to the participants if they are not already part of the trip
        if (!trip.participants.includes(req.user._id)) {
            trip.participants.push(req.user._id);

            // Recalculate settlements including settlement history
            const settlements = calculateSettlements(trip.expenses, trip.participants, trip.settlements, trip.settlementHistory);
            trip.settlements = settlements;

            await trip.save();
        }

        // Once successfully added, return a success message
        res.json({ message: 'You have successfully joined the trip!' });
    } catch (err) {
        res.status(500).json({ message: 'Error joining trip', error: err.message });
    }
};

exports.getExpenseById = async (req, res) => {
    const { tripId, expenseId } = req.params;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const expense = trip.expenses.id(expenseId); // Assuming you store expenses as a subdocument array
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        res.json(expense);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error });
    }
};

exports.editExpense = async (req, res) => {
    const { tripId, expenseId } = req.params;
    const { expenseName, expenseDescription, amount, responsibleUserId, splitMethod, splitParticipants } = req.body;

    try {
        // Find the trip by ID
        const trip = await Trip.findById(tripId);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        // Find the expense within the trip's expenses array by its ID
        const expense = trip.expenses.id(expenseId);
        if (!expense) {
            return res.status(404).json({ message: 'Expense not found' });
        }

        // Ensure that the responsible user is part of the trip participants
        if (!trip.participants.includes(responsibleUserId)) {
            return res.status(400).json({ message: 'Responsible user must be a participant of the trip' });
        }

        // If split method is 'specific', verify that all split participants are valid trip participants
        if (splitMethod === 'specific') {
            const invalidParticipants = splitParticipants.filter(participantId => !trip.participants.includes(participantId));
            if (invalidParticipants.length > 0) {
                return res.status(400).json({ message: 'One or more split participants are not part of the trip' });
            }
        }

        // Update the expense fields
        expense.expenseName = expenseName || expense.expenseName;
        expense.expenseDescription = expenseDescription || expense.expenseDescription;
        expense.amount = amount || expense.amount;
        expense.responsibleUserId = responsibleUserId || expense.responsibleUserId;
        expense.splitMethod = splitMethod || expense.splitMethod;
        expense.splitParticipants = splitMethod === 'even' ? trip.participants : splitParticipants;

        // Save the trip with the updated expense
        const settlements = calculateSettlements(trip.expenses, trip.participants);
        trip.settlements = settlements;

        await trip.save();

        res.status(200).json({ message: 'Expense updated successfully', expense });
    } catch (error) {
        res.status(500).json({ message: 'Error updating expense', error: error.message });
    }
};

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

// Function to handle image upload
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

// Mark a debt as settled and move it to history
exports.settleDebt = async (req, res) => {
    try {
        const { tripId, settlementId } = req.params;
        const { amountToSettle } = req.body; // Amount the user wants to settle

        const trip = await Trip.findById(tripId);

        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const settlement = trip.settlements.id(settlementId);

        if (!settlement) {
            return res.status(404).json({ message: 'Settlement not found' });
        }

        // Ensure the amount to settle is valid
        if (isNaN(amountToSettle) || amountToSettle <= 0) {
            return res.status(400).json({ message: 'Invalid settlement amount' });
        }

        // Check if the amount to settle is more than the remaining amount
        if (amountToSettle > settlement.remainingAmount) {
            return res.status(400).json({ message: 'Cannot settle more than the remaining amount' });
        }

        // Move the settled amount to history
        const settledDebt = {
            debtor: settlement.debtor,
            creditor: settlement.creditor,
            amount: amountToSettle,  // Settled amount
            dateSettled: new Date(),
        };

        trip.settlementHistory.push(settledDebt);

        // Update the remaining amount
        settlement.remainingAmount -= amountToSettle;

        // If the remaining amount is zero, mark the settlement as settled
        if (settlement.remainingAmount === 0) {
            settlement.isSettled = true;
        }

        await trip.save();

        res.status(200).json({
            message: 'Debt settled successfully',
            settlement: settledDebt,
        });
    } catch (error) {
        console.error('Error settling debt:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.settleSettlement = async (req, res) => {
    const { settlementId, tripId } = req.params;
    const { amountToSettle, paymentMethod } = req.body;

    try {
        const trip = await Trip.findById(tripId);
        const settlement = trip.settlements.id(settlementId);

        if (!settlement) {
            return res.status(404).json({ message: 'Settlement not found' });
        }

        if (paymentMethod === 'paypal') {
            // Handle the PayPal logic if needed (verify payment, etc.)
        }

        settlement.isSettled = true;
        await trip.save();

        res.status(200).json({ message: 'Settlement completed successfully' });
    } catch (error) {
        console.error('Error settling payment:', error);
        res.status(500).json({ message: 'Server error' });
    }
};
