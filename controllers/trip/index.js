const { createTrip, getTrips, getMyTrips, getUserTrips, getTripById, updateTrip, deleteTrip } = require('./trip');
const { inviteToTrip, addParticipant, removeParticipant } = require('./participant');
const { createTripExpense, deleteExpense, calculateFairShare, getExpenseById, editExpense } = require('./expense');
const { getTripTimeline, updateTripTimeline } = require('./timeline');
const { settleDebt } = require('./settlement');
const { addAdministrator, removeAdministrator } = require('./administrator');
const { uploadTripImage } = require('./media');
const { generateJoinLink, joinTrip, inviteUserToTripByEmail } = require('./link');

module.exports = {
    createTrip,
    getTrips,
    getMyTrips,
    getUserTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    inviteToTrip,
    addParticipant,
    removeParticipant,
    createTripExpense,
    deleteExpense,
    calculateFairShare,
    getExpenseById,
    editExpense,
    getTripTimeline,
    updateTripTimeline,
    settleDebt,
    addAdministrator,
    removeAdministrator,
    uploadTripImage,
    generateJoinLink,
    joinTrip,
    inviteUserToTripByEmail
};
