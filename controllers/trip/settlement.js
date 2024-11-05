const Trip = require('../../models/Trip');
const calculateSettlements = require('../../helpers/settlementHelper');

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
