const express = require('express');
const multer = require('multer')
const {
    createTrip,
    inviteToTrip,
    getTrips,
    getMyTrips,
    getUserTrips,
    getTripById,
    updateTrip,
    deleteTrip,
    addParticipant,
    removeParticipant,
    createTripExpense,
    deleteExpense,
    calculateFairShare,
    generateJoinLink,
    joinTrip,
    getExpenseById,
    editExpense,
    getTripTimeline,
    updateTripTimeline,
    uploadTripImage,
    settleDebt
} = require('../controllers/tripController');
const authMiddleware = require('../middlewares/authMiddleware');
const router = express.Router();

// Trip routes
router.post('/trips', authMiddleware, createTrip);
router.post('/trips/invite', authMiddleware, inviteToTrip);
router.get('/trips', authMiddleware, getTrips);
router.get('/my-trips', authMiddleware, getMyTrips);
router.get('/user-trips', authMiddleware, getUserTrips);

// Trip details, update, delete
router.get('/trips/:tripId', authMiddleware, getTripById);
router.put('/trips/:tripId', authMiddleware, updateTrip);
router.delete('/trips/:tripId', authMiddleware, deleteTrip);

// Participant management
router.post('/trips/:tripId/add-participant', authMiddleware, addParticipant);
router.post('/trips/:tripId/remove-participant', authMiddleware, removeParticipant);

// Join a trip
router.post('/trips/:tripId/generate-join-link', authMiddleware, generateJoinLink);
router.post('/join/:tripId/:token', authMiddleware, joinTrip);
router.get('/trips/:tripId/:token', getTripById);

// Expenses
router.post('/trips/:tripId/expenses', authMiddleware, createTripExpense);
router.get('/trips/:tripId/expenses/:expenseId', authMiddleware, getExpenseById);
router.put('/trips/:tripId/expenses/:expenseId', authMiddleware, editExpense);
router.delete('/trips/:tripId/expenses/:expenseId', authMiddleware, deleteExpense);
router.post('/trips/:tripId/calculate-fair-share', authMiddleware, calculateFairShare);

// Route to get the trip timeline
router.get('/trips/:tripId/timeline', authMiddleware, getTripTimeline);
// Route to update the trip timeline
router.put('/trips/:tripId/timeline', authMiddleware, updateTripTimeline);

// Mark settlement as settled
router.post('/trips/:tripId/settlements/:settlementId/settle', authMiddleware, settleDebt);


// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + file.originalname); // Unique file names
    },
});
const upload = multer({ storage });

router.post('/trips/:tripId/upload-image', upload.single('image'), uploadTripImage);

module.exports = router;
