const express = require('express');
const { createPayout } = require('../paypal');
const router = express.Router();

router.post('/create-paypal-payout', async (req, res) => {
    const { email, amount } = req.body;

    try {
        const payoutResponse = await createPayout(email, amount);
        res.json(payoutResponse);
    } catch (error) {
        res.status(500).json({ error: 'Payout failed', details: error.message });
    }
});

module.exports = router;
