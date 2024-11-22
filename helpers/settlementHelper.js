const calculateSettlements = (expenses, participants, previousSettlements = [], settlementHistory = []) => {
    const balances = {};

    // Initialize balances for all participants
    participants.forEach(participant => {
        balances[participant] = 0;
    });

    // Process each expense
    expenses.forEach(({ amount, responsibleUserId, splitParticipants }) => {
        const perParticipantShare = amount / splitParticipants.length;

        // Adjust balances
        splitParticipants.forEach(participantId => {
            if (participantId !== responsibleUserId) {
                balances[participantId] -= perParticipantShare; // Subtract from debtor
                balances[responsibleUserId] += perParticipantShare; // Add to creditor
            }
        });
    });

    // Adjust balances based on settlement history
    settlementHistory.forEach(({ debtor, creditor, amount }) => {
        if (balances[debtor] !== undefined) balances[debtor] += amount;
        if (balances[creditor] !== undefined) balances[creditor] -= amount;
    });

    // Separate debtors and creditors
    const debtors = [];
    const creditors = [];
    Object.entries(balances).forEach(([participantId, balance]) => {
        if (balance < 0) {
            debtors.push({ participantId, balance: -balance }); // Owes money
        } else if (balance > 0) {
            creditors.push({ participantId, balance }); // Is owed money
        }
    });

    // Sort debtors and creditors for precise matching
    debtors.sort((a, b) => a.balance - b.balance); // Smallest debts first
    creditors.sort((a, b) => a.balance - b.balance); // Smallest credits first

    // Simplify settlements
    const settlements = [];
    while (debtors.length > 0 && creditors.length > 0) {
        const debtor = debtors[0];
        const creditor = creditors[0];
        const settlementAmount = Math.min(debtor.balance, creditor.balance);

        settlements.push({
            debtor: debtor.participantId,
            creditor: creditor.participantId,
            amount: settlementAmount,
        });

        debtor.balance -= settlementAmount;
        creditor.balance -= settlementAmount;

        if (debtor.balance === 0) debtors.shift();
        if (creditor.balance === 0) creditors.shift();
    }

    return settlements;
};

module.exports = calculateSettlements;