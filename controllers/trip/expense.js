const Trip = require('../../models/Trip');
const calculateSettlements = require('../../helpers/settlementHelper');

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

exports.getExpenseById = async (req, res) => {
    const { tripId, expenseId } = req.params;

    try {
        const trip = await Trip.findById(tripId);
        if (!trip) {
            return res.status(404).json({ message: 'Trip not found' });
        }

        const expense = trip.expenses.id(expenseId);
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
