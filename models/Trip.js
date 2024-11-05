const mongoose = require('mongoose');
const crypto = require('crypto');
const { type } = require('os');

const activitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    time: { type: String, required: true },
    bookingLink: {type: String, required: false},
    transportation: {
        title: {type: String },
        lat: { type: Number, required: false },
        lng: { type: Number, required: false },
    },
});

const tripSchema = new mongoose.Schema({
    name: { type: String, required: true },
    description: { type: String, required: false },
    image: String,
    currency: String,
    creator: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    administrators: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    location: {
        destination: { type: String, required: false },
        coordinates: {
            lat: { type: Number, required: false },
            lng: { type: Number, required: false },
        },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    joinToken: {
        type: String,
        unique: true,
        default: function () {
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

// Method to check if a user is an administrator or the creator
tripSchema.methods.isAdminOrCreator = function (userId) {
    return (
        this.creator.equals(userId) ||
        this.administrators.some((adminId) => adminId.equals(userId))
    );
};

// Method to add a user as an administrator
tripSchema.methods.addAdministrator = function (userId) {
    if (!this.administrators.includes(userId)) {
        this.administrators.push(userId);
    }
    return this.save();
};

// Method to remove a user from administrators
tripSchema.methods.removeAdministrator = function (userId) {
    this.administrators = this.administrators.filter(
        (adminId) => !adminId.equals(userId)
    );
    return this.save();
};

const Trip = mongoose.model('Trip', tripSchema);

module.exports = Trip;