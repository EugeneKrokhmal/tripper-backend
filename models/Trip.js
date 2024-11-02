const mongoose = require('mongoose');
const crypto = require('crypto');

const activitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    time: { type: String, required: true },
});

const tripSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: true },
    image: String,
    currency: String,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    location: {
        destination: { type: String, required: true },
        coordinates: {
            lat: { type: Number, required: true },
            lng: { type: Number, required: true },
        },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    joinToken: {
        type: String,
        unique: true,
        default: function () {
            // Generate a unique token for each trip
            return crypto.randomBytes(16).toString('hex');
        },
    },
    expenses: [
        {
            expenseName: { type: String, required: true },
            expenseDescription: { type: String, required: false },
            amount: { type: Number, required: true },
            responsibleUserId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            splitMethod: { type: String, enum: ['even', 'specific'], required: true },
            splitParticipants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
            date: { type: Date, default: Date.now },
            confirmationFile: { type: String, required: false }
        }
    ],
    fairShare: { type: Number },
    settlements: [
        {
            debtor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            creditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true },
            isSettled: { type: Boolean, default: false },
            remainingAmount: { type: Number, required: true, default: function () { return this.amount; } },
        },
    ],
    settlementHistory: [
        {
            debtor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            creditor: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
            amount: { type: Number, required: true },
            dateSettled: { type: Date, default: Date.now }
        },
    ],
    timeline: {
        type: Map,
        of: [activitySchema],
        default: {}
    }
});

tripSchema.methods.generateJoinToken = function () {
    const token = crypto.randomBytes(16).toString('hex');
    this.joinToken = token;
    return token;
};

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;
