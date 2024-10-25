const calculateSettlements = (expenses, participants, previousSettlements = [], settlementHistory = []) => {
    const balances = {};

    // Initialize balances for each participant
    participants.forEach(p => {
        balances[p._id] = 0;
    });

    // Loop through each expense and adjust balances
    expenses.forEach(expense => {
        const amountPerParticipant = expense.amount / expense.splitParticipants.length;

        expense.splitParticipants.forEach(participantId => {
            if (participantId !== expense.responsibleUserId) {
                // Subtract the share from participant
                balances[participantId] -= amountPerParticipant;
                // Add the same amount to the responsible user
                balances[expense.responsibleUserId] += amountPerParticipant;
            }
        });
    });

    // Apply unsettled amounts from previous settlements and subtract already settled amounts
    settlementHistory.forEach(history => {
        if (balances[history.debtor]) {
            balances[history.debtor] += history.amount; // Add the amount already settled
        }
        if (balances[history.creditor]) {
            balances[history.creditor] -= history.amount; // Subtract the settled amount from the creditor
        }
    });

    const settlements = [];
    const creditors = [];
    const debtors = [];

    // Separate creditors and debtors based on their final balances
    Object.entries(balances).forEach(([participantId, balance]) => {
        if (balance > 0) {
            creditors.push({ participantId, amount: balance });
        } else if (balance < 0) {
            debtors.push({ participantId, amount: -balance });
        }
    });

    // Match debtors with creditors to calculate new settlements
    while (debtors.length && creditors.length) {
        const debtor = debtors[0];
        const creditor = creditors[0];
        const settlementAmount = Math.min(debtor.amount, creditor.amount);

        settlements.push({
            debtor: debtor.participantId,
            creditor: creditor.participantId,
            amount: settlementAmount,
        });

        debtor.amount -= settlementAmount;
        creditor.amount -= settlementAmount;

        if (debtor.amount === 0) debtors.shift();
        if (creditor.amount === 0) creditors.shift();
    }

    return settlements;
};

module.exports = calculateSettlements;